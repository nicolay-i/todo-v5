#!/usr/bin/env node
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// archiver is in devDependencies
let archiver;
try { archiver = require('archiver'); } catch {}

// Загрузка переменных окружения из .env/.env.local (приоритет .env.local)
(() => {
  const cwd = process.cwd();
  const envLocalPath = path.join(cwd, '.env.local');
  const envPath = path.join(cwd, '.env');

  // Загружаем .env сначала, потом .env.local перекрывает
  let loadedFrom = [];
  try {
    if (fs.existsSync(envPath)) {
      require('dotenv').config({ path: envPath });
      loadedFrom.push('.env');
    }
  } catch {}
  try {
    if (fs.existsSync(envLocalPath)) {
      require('dotenv').config({ path: envLocalPath, override: true });
      loadedFrom.push('.env.local');
    }
  } catch {}
  if (loadedFrom.length) {
    console.log(`🌱 Загружены переменные окружения из: ${loadedFrom.join(', ')}`);
  } else {
    console.log('🌱 Файлы .env/.env.local не найдены или не загружены');
  }
})();

class CapRoverDeployer {
  constructor(config = {}) {
    this.config = {
      appName: config.appName || process.env.CAPROVER_APP_NAME,
      serverUrl: config.serverUrl || process.env.CAPROVER_SERVER_URL,
      appToken: config.appToken || process.env.CAPROVER_APP_TOKEN,
    };

    console.log('🔧 Конфигурация деплоя:', JSON.stringify(this.config));
  }

  async build() {
    console.log('🔨 Начинаю сборку Next.js приложения...');
    
    return new Promise((resolve, reject) => {
      exec('npm run build', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Ошибка при сборке:', error);
          reject(error);
          return;
        }
        
        console.log('✅ Сборка завершена успешно');
        console.log(stdout);
        resolve();
      });
    });
  }

  async copyStaticFiles() {
    console.log('📁 Копирую статические файлы...');
    
    const commands = [
      // Копируем папку public
      'cp -r public .next/standalone/ 2>/dev/null || true',
      // Копируем статические файлы
      'cp -r .next/static .next/standalone/.next/ 2>/dev/null || true'
    ];

    for (const command of commands) {
      console.log(`Выполняю команду: ${command}`);
      await this.execCommand(command);
    }
    
    console.log('✅ Статические файлы скопированы');
  }

  async testLocal() {
    console.log('🧪 Тестирую standalone сборку локально...');
    
    return new Promise((resolve, reject) => {
      console.log('Запуск на http://localhost:3000');
      console.log('Нажмите Ctrl+C для остановки');
      
      const server = exec('cd .next/standalone && node server.js', (error, stdout, stderr) => {
        if (error && error.signal !== 'SIGTERM') {
          console.error('❌ Ошибка запуска сервера:', error);
          reject(error);
          return;
        }
        resolve();
      });
      
      server.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      
      server.stderr.on('data', (data) => {
        console.error(data.toString());
      });
    });
  }

  async deployToCapRover() {
    console.log('🚀 Деплою на CapRover...');

    // Если доступен archiver, создаём локальный tar с нужными артефактами,
    // чтобы сборка не шла на сервере и точно включала .next/*
    const canPack = Boolean(archiver);
  const cwd = process.cwd();
  const tarPath = path.join(cwd, `caprover-deploy.tar`);
  try { if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath); } catch {}

    if (canPack) {
      await this.ensureBuildArtifacts();
      await this.createTarball({
        tarPath,
        include: [
          { type: 'file', abs: path.join(cwd, 'captain-definition'), dest: 'captain-definition' },
          { type: 'dir', abs: path.join(cwd, '.next', 'standalone'), dest: '.next/standalone' },
          { type: 'dir', abs: path.join(cwd, '.next', 'static'), dest: '.next/static' },
          { type: 'dir', abs: path.join(cwd, 'public'), dest: 'public' },
          // Добавим package.json и lock файлы на всякий случай
          { type: 'file', abs: path.join(cwd, 'package.json'), dest: 'package.json' },
          { type: 'file-optional', abs: path.join(cwd, 'pnpm-lock.yaml'), dest: 'pnpm-lock.yaml' },
          { type: 'file-optional', abs: path.join(cwd, 'package-lock.json'), dest: 'package-lock.json' },
          { type: 'file-optional', abs: path.join(cwd, 'yarn.lock'), dest: 'yarn.lock' },
        ]
      });

      const tarRel = path.basename(tarPath);
      const deployCommand = this.config.appToken
        ? `caprover deploy -h ${this.config.serverUrl} -a ${this.config.appName} --appToken ${this.config.appToken} -t ${tarRel}`
        : `caprover deploy -a ${this.config.appName} -t ${tarRel}`;

      console.log(`Выполняю команду: ${deployCommand}`);
      try {
        return await this.execCommand(deployCommand);
      } finally {
        // Чистим архив
        try { fs.unlinkSync(tarPath); } catch {}
      }
    }

    // fallback: отправляем текущую папку как контекст
    const deployCommand = this.config.appToken 
      ? `caprover deploy -h ${this.config.serverUrl} -a ${this.config.appName} --appToken ${this.config.appToken}`
      : `caprover deploy -a ${this.config.appName}`;
    console.log(`Выполняю команду: ${deployCommand}`);
    return this.execCommand(deployCommand);
  }

  async ensureBuildArtifacts() {
    const standalone = path.join(process.cwd(), '.next', 'standalone');
    const staticDir = path.join(process.cwd(), '.next', 'static');
    const capDef = path.join(process.cwd(), 'captain-definition');

    const missing = [];
    if (!fs.existsSync(capDef)) missing.push('captain-definition');
    if (!fs.existsSync(standalone)) missing.push('.next/standalone');
    if (!fs.existsSync(staticDir)) missing.push('.next/static');

    if (missing.length) {
      throw new Error(`Отсутствуют артефакты сборки: ${missing.join(', ')}. Убедитесь, что выполнен next build.`);
    }
  }

  async createTarball({ tarPath, include }) {
    console.log(`📦 Упаковываю контекст деплоя: ${tarPath}`);
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(tarPath);
      const archive = archiver('tar', { gzip: false });
      output.on('close', resolve);
      output.on('error', reject);
      archive.on('error', reject);
      archive.pipe(output);

      for (const entry of include) {
        const exists = fs.existsSync(entry.abs);
        if (!exists && entry.type === 'file-optional') continue;
        if (!exists) throw new Error(`Не найден путь для упаковки: ${entry.abs}`);
        if (entry.type === 'file' || entry.type === 'file-optional') {
          archive.file(entry.abs, { name: entry.dest });
        } else if (entry.type === 'dir') {
          archive.directory(entry.abs, entry.dest);
        }
      }

      archive.finalize();
    });
  }

  async execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          // Печатаем stdout/stderr для диагностики
          if (stdout) console.log(stdout);
          if (stderr) console.error(stderr);
          console.error(`❌ Ошибка выполнения команды: ${command}`, error);
          reject(error);
          return;
        }
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        resolve(stdout);
      });
    });
  }

  async deploy() {
    try {
      // Этап 1: Сборка
  await this.build();
      
      // Этап 2: Копирование статических файлов
  // На этапе образа они копируются Dockerfile'ом из .next/static и public
      
      // Этап 3: Деплой
      await this.deployToCapRover();
      
      console.log('🎉 Деплой завершен полностью!');
      
    } catch (error) {
      console.error('💥 Ошибка в процессе деплоя:', error);
      process.exit(1);
    }
  }

  async testStandalone() {
    try {
      // Этап 1: Сборка
      await this.build();
      
      // Этап 2: Копирование статических файлов
      await this.copyStaticFiles();
      
      // Этап 3: Локальное тестирование
      await this.testLocal();
      
    } catch (error) {
      console.error('💥 Ошибка при тестировании:', error);
      process.exit(1);
    }
  }
}

const deployer = new CapRoverDeployer({});

// Определяем режим запуска
const mode = process.argv[2];

if (mode === 'test') {
  // Для тестирования: node deploy-script.js test
  deployer.testStandalone();
} else {
  // Для деплоя: node deploy-script.js
  deployer.deploy();
}
