#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const mode = process.argv[2]; // 'dev' или 'prod'

if (!mode || !['dev', 'prod'].includes(mode)) {
  console.error('Использование: node scripts/switch-db.js [dev|prod]');
  process.exit(1);
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

// Определяем блоки datasource для каждого режима
const datasources = {
  dev: `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL_SQLITE")
}`,
  prod: `datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}`
};

try {
  // Читаем текущий файл схемы
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // Проверяем наличие маркеров
  const startMarker = '// DATASOURCE_START - Не удаляйте эту строку, используется для автоматической замены';
  const endMarker = '// DATASOURCE_END - Не удаляйте эту строку, используется для автоматической замены';
  
  if (!schemaContent.includes(startMarker) || !schemaContent.includes(endMarker)) {
    console.error('⚠️  Маркеры DATASOURCE_START/DATASOURCE_END не найдены в schema.prisma');
    console.error('Пожалуйста, убедитесь, что файл содержит правильные маркеры для автоматической замены');
    process.exit(1);
  }

  // Находим позиции маркеров
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

  // Формируем новое содержимое (первый шаг — datasource)
  const before = lines.slice(0, startIdx + 1);
  const after = lines.slice(endIdx);
  const newDatasource = datasources[mode].split('\n');
  let newLines = [...before, ...newDatasource, ...after];
  let newContent = newLines.join('\n');

  // Записываем обновлённый файл
  fs.writeFileSync(schemaPath, newContent, 'utf8');

  console.log(`✅ Схема переключена на режим: ${mode === 'dev' ? 'SQLite (разработка)' : 'PostgreSQL (production)'}`);
  console.log('📝 Обновлён datasource блок и путь migrations в generator client');
  
  if (mode === 'dev') {
    console.log('\n📌 Для работы с SQLite установите DATABASE_URL:');
    console.log('   DATABASE_URL="file:./dev.db"');
    console.log('   Папка миграций: prisma/migrations-sqlite');
  } else {
    console.log('\n📌 Для работы с PostgreSQL установите DATABASE_URL и SHADOW_DATABASE_URL');
    console.log('   Папка миграций: prisma/migrations');
  }
} catch (error) {
  console.error('Ошибка при переключении схемы:', error.message);
  process.exit(1);
}
