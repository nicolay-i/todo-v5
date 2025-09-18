#!/usr/bin/env node
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class CapRoverDeployer {
  constructor(config = {}) {
    this.config = {
      appName: config.appName || process.env.CAPROVER_APP_NAME,
      serverUrl: config.serverUrl || process.env.CAPROVER_SERVER_URL,
      appToken: config.appToken || process.env.CAPROVER_APP_TOKEN,
      buildDir: '.next',
      deployFiles: [
        '.next/standalone',
        'public',
        '.next/static',
        'captain-definition',
        'package.json'
      ]
    };
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

  async createDeploymentArchive() {
    console.log('📦 Создаю архив для деплоя...');
    
    const output = fs.createWriteStream('deploy.tar');
    const archive = archiver('tar');

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`✅ Архив создан: ${archive.pointer()} байт`);
        resolve();
      });

      archive.on('error', (err) => {
        console.error('❌ Ошибка создания архива:', err);
        reject(err);
      });

      archive.pipe(output);

      // Добавляем файлы для деплоя
      this.config.deployFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            archive.directory(filePath, path.basename(filePath));
          } else {
            archive.file(filePath, { name: path.basename(filePath) });
          }
          console.log(`📁 Добавлен: ${filePath}`);
        } else {
          console.warn(`⚠️ Файл не найден: ${filePath}`);
        }
      });

      // Специальная обработка для standalone сборки
      if (fs.existsSync('.next/standalone')) {
        // Копируем содержимое standalone в корень архива
        archive.directory('.next/standalone/', false);
        
        // Добавляем статические файлы
        if (fs.existsSync('.next/static')) {
          archive.directory('.next/static/', '.next/static');
        }
        
        // Добавляем публичные файлы
        if (fs.existsSync('public')) {
          archive.directory('public/', 'public');
        }
      }

      archive.finalize();
    });
  }

  async deployToCapRover() {
    console.log('🚀 Деплою на CapRover...');

    const deployCommand = this.config.appToken 
      ? `caprover deploy -h ${this.config.serverUrl} -a ${this.config.appName} -t ${this.config.appToken}`
      : `caprover deploy -a ${this.config.appName}`;

    return new Promise((resolve, reject) => {
      exec(deployCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Ошибка деплоя:', error);
          reject(error);
          return;
        }
        
        console.log('✅ Деплой завершен успешно!');
        console.log(stdout);
        resolve();
      });
    });
  }

  async deploy() {
    try {
      // Этап 1: Сборка
      await this.build();
      
      // Этап 2: Создание архива (опционально)
      // await this.createDeploymentArchive();
      
      // Этап 3: Деплой
      await this.deployToCapRover();
      
      // Очистка временных файлов
      if (fs.existsSync('deploy.tar')) {
        fs.unlinkSync('deploy.tar');
      }
      
      console.log('🎉 Деплой завершен полностью!');
      
    } catch (error) {
      console.error('💥 Ошибка в процессе деплоя:', error);
      process.exit(1);
    }
  }
}

// Конфигурация (можно вынести в отдельный файл)
const config = {
  appName: 'my-nextjs-app',
  serverUrl: 'https://captain.mydomain.com',
  // appToken: 'your-app-token' // или через переменную окружения
};

// Запуск деплоя
const deployer = new CapRoverDeployer(config);
deployer.deploy();
