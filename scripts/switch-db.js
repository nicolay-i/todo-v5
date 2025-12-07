#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const mode = process.argv[2]; // 'dev' или 'prod'

if (!mode || !['dev', 'prod'].includes(mode)) {
  console.error('Использование: node scripts/switch-db.js [dev|prod]');
  process.exit(1);
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const configPath = path.join(__dirname, '..', 'prisma.config.ts');

// Определяем provider для schema.prisma (только provider в Prisma 7)
const datasourceBlocks = {
  dev: `datasource db {
  provider = "sqlite"
}`,
  prod: `datasource db {
  provider = "postgresql"
}`
};

// Определяем конфигурацию datasource для prisma.config.ts
const datasourceConfigs = {
  dev: {
    url: 'env("DATABASE_URL_SQLITE")',
    shadowDatabaseUrl: undefined, // SQLite не требует shadow database
  },
  prod: {
    url: 'env("DATABASE_URL")',
    shadowDatabaseUrl: 'env("SHADOW_DATABASE_URL")',
  }
};

// Пути миграций
const migrationPaths = {
  dev: 'prisma/migrations-sqlite',
  prod: 'prisma/migrations',
};

try {
  // === 1. Обновляем schema.prisma (provider) ===
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  const startMarker = '// DATASOURCE_START - Не удаляйте эту строку, используется для автоматической замены';
  const endMarker = '// DATASOURCE_END - Не удаляйте эту строку, используется для автоматической замены';
  
  if (!schemaContent.includes(startMarker) || !schemaContent.includes(endMarker)) {
    console.error('⚠️  Маркеры DATASOURCE_START/DATASOURCE_END не найдены в schema.prisma');
    process.exit(1);
  }

  const lines = schemaContent.split('\n');
  let startIdx = -1;
  let endIdx = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('DATASOURCE_START')) {
      startIdx = i;
    }
    if (lines[i].includes('DATASOURCE_END')) {
      endIdx = i;
      break;
    }
  }

  if (startIdx === -1 || endIdx === -1) {
    console.error('⚠️  Не удалось найти маркеры замены в schema.prisma');
    process.exit(1);
  }

  // Обновляем datasource provider
  const before = lines.slice(0, startIdx + 1);
  const after = lines.slice(endIdx);
  const newDatasource = datasourceBlocks[mode].split('\n');
  let newSchemaLines = [...before, ...newDatasource, ...after];
  
  // Обновляем путь migrations и engineType в generator client
  const migrationPath = migrationPaths[mode];
  const engineType = 'client';
  let engineTypeSet = false;
  let migrationsLineIdx = -1;
  
  for (let i = 0; i < newSchemaLines.length; i++) {
    const line = newSchemaLines[i];
    
    if (line.includes('migrations =')) {
      newSchemaLines[i] = `  migrations = "${migrationPath}"`;
      migrationsLineIdx = i;
    }
    
    if (line.includes('engineType')) {
      newSchemaLines[i] = `  engineType = "${engineType}"`;
      engineTypeSet = true;
    }
  }
  
  // Если engineType не найден, добавляем его после migrations
  if (!engineTypeSet) {
    if (migrationsLineIdx >= 0) {
      newSchemaLines.splice(migrationsLineIdx + 1, 0, `  engineType = "${engineType}"`);
    } else {
      // Если migrations не найден, ищем binaryTargets и добавляем перед ним
      for (let i = 0; i < newSchemaLines.length; i++) {
        if (newSchemaLines[i].includes('binaryTargets')) {
          newSchemaLines.splice(i, 0, `  engineType = "${engineType}"`);
          break;
        }
      }
    }
  }
  
  fs.writeFileSync(schemaPath, newSchemaLines.join('\n'), 'utf8');

  // === 2. Обновляем prisma.config.ts (datasource url и migrations path) ===
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  const config = datasourceConfigs[mode];
  const migrationFolder = migrationPath.split('/')[1];
  
  // Обновляем datasource блок
  // Заменяем url напрямую
  configContent = configContent.replace(
    /url:\s*env\(["'][^"']+["']\)/,
    `url: ${config.url}`
  );
  
  // Обновляем shadowDatabaseUrl
  if (config.shadowDatabaseUrl) {
    // Если shadowDatabaseUrl уже есть, заменяем его
    if (configContent.includes('shadowDatabaseUrl:')) {
      configContent = configContent.replace(
        /shadowDatabaseUrl:\s*env\(["'][^"']+["']\)/,
        `shadowDatabaseUrl: ${config.shadowDatabaseUrl}`
      );
    } else {
      // Если нет, добавляем после url
      configContent = configContent.replace(
        /(url:\s*[^\n]+)/,
        `$1,\n    shadowDatabaseUrl: ${config.shadowDatabaseUrl}`
      );
    }
  } else {
    // Удаляем shadowDatabaseUrl если его не должно быть (для SQLite)
    // Удаляем строку целиком с запятой перед ней или без
    configContent = configContent.replace(/,\s*\n\s*shadowDatabaseUrl:\s*env\(["'][^"']+["']\)/g, '');
    configContent = configContent.replace(/\n\s*shadowDatabaseUrl:\s*env\(["'][^"']+["']\)/g, '');
  }
  
  // Обновляем путь migrations - заменяем значение path внутри блока migrations
  // Ищем строку с path: path.join("prisma", "...")
  const pathRegex = /path:\s*path\.join\(["']prisma["'],\s*["'][^"']+["']\)/;
  const newPathValue = `path: path.join("prisma", "${migrationFolder}")`;
  
  if (pathRegex.test(configContent)) {
    configContent = configContent.replace(pathRegex, newPathValue);
  } else {
    // Если не нашли, заменяем весь блок migrations
    const migrationsRegex = /migrations:\s*\{[\s\S]*?\n\s*\},/;
    const migrationsBlock = `migrations: {
    path: path.join("prisma", "${migrationFolder}"),
  },`;
    configContent = configContent.replace(migrationsRegex, migrationsBlock);
  }
  
  fs.writeFileSync(configPath, configContent, 'utf8');

  console.log(`✅ Схема переключена на режим: ${mode === 'dev' ? 'SQLite (разработка)' : 'PostgreSQL (production)'}`);
  console.log('📝 Обновлены:');
  console.log('   - provider в schema.prisma');
  console.log('   - datasource в prisma.config.ts');
  console.log(`   - путь migrations: ${migrationPath}`);
  
  if (mode === 'dev') {
    console.log('\n📌 Для работы с SQLite установите в .env.development:');
    console.log('   DATABASE_MODE="dev"');
    console.log('   DATABASE_URL_SQLITE="file:./dev.db"');
    console.log('   (Next.js автоматически загрузит .env.development в dev режиме)');
  } else {
    console.log('\n📌 Для работы с PostgreSQL установите в .env или .env.production:');
    console.log('   DATABASE_MODE="prod"');
    console.log('   DATABASE_URL="postgresql://..."');
    console.log('   SHADOW_DATABASE_URL="postgresql://..." (опционально)');
  }
  
  console.log('\n⚠️  Не забудьте перегенерировать Prisma Client:');
  console.log('   pnpm prisma:generate');
  
} catch (error) {
  console.error('Ошибка при переключении схемы:', error.message);
  process.exit(1);
}
