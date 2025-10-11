#!/usr/bin/env node
/**
 * Удаление worktree и связанной ветки.
 * Возможности:
 *  - Интерактивный список существующих worktree (git worktree list)
 *  - Фильтрация только по паттерну "<repoName>__" (создавались task.js)
 *  - Показываем: индекс, путь, ветка, пометка если текущая или main/dev
 *  - Подтверждение перед удалением
 *  - Опция --all для массового удаления (кроме main/dev) с доп. подтверждением
 *  - Безопасность: не удаляем если есть незакоммиченные изменения внутри worktree (git status --porcelain)
 *  - Удаляем директорию (fs.rm) после git worktree remove
 *  - Если локальная ветка не имеет других worktree -> удаляем ветку (git branch -D)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const COLORS = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

function run(cmd, opts={}) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts }).trim();
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(question, ans => { rl.close(); res(ans); }));
}

function parseWorktreeList(raw) {
  // Формат git worktree list: строки вида
  // /abs/path/to/repo (bare)
  // /abs/path/to/repo  <hash> [branch]
  // Для доп. worktree обычно: PATH  HASH  [refs/heads/branch]
  return raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(line => {
    const parts = line.split(/\s+/);
    const pathPart = parts[0];
    const branchMatch = line.match(/\[(.+?)\]$/); // [branch]
    const branch = branchMatch ? branchMatch[1].replace('refs/heads/', '') : null;
    return { line, path: pathPart, branch };
  });
}

function detectRepoRoot() {
  try { return run('git rev-parse --show-toplevel'); } catch { return process.cwd(); }
}

async function main() {
  const repoRoot = detectRepoRoot();
  process.chdir(repoRoot);
  let raw;
  try { raw = run('git worktree list'); } catch (e) { console.error(COLORS.red('Не git репозиторий или git worktree не поддерживается.')); process.exit(1); }

  const repoDirName = path.basename(repoRoot);
  const all = parseWorktreeList(raw);

  // Фильтруем только worktree созданные task.js (имя каталога начинается с <repo>__)
  const candidates = all.filter(w => path.basename(w.path).startsWith(repoDirName + '__'));

  if (candidates.length === 0) {
    console.log(COLORS.yellow('Нет worktree созданных скриптом task.js.'));
    process.exit(0);
  }

  if (process.argv.includes('--list')) {
    console.log('Существующие worktree:');
    candidates.forEach((w,i) => console.log(`${i+1}. ${w.path}  ${w.branch ? '('+w.branch+')' : ''}`));
    process.exit(0);
  }

  if (process.argv.includes('--all')) {
    const confirm = (await ask(COLORS.red('Удалить ВСЕ найденные worktree? (Y/n): '))).trim().toLowerCase();
    if (confirm === 'n' || confirm === 'no') { console.log('Отменено.'); process.exit(0); }
    for (const w of candidates) {
      await removeWorktree(w);
    }
    console.log(COLORS.green('Готово.'));
    process.exit(0);
  }

  console.log('Найдены worktree:');
  candidates.forEach((w,i) => console.log(`${i+1}. ${w.path}  ${w.branch ? '('+w.branch+')' : ''}`));
  const ans = await ask('Введите номер для удаления (или пусто чтобы выйти): ');
  if (!ans) { console.log('Отменено.'); process.exit(0); }
  const idx = parseInt(ans, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= candidates.length) { console.log('Неверный выбор.'); process.exit(1); }
  const target = candidates[idx];
  const confirm = (await ask(`Подтвердите удаление ${target.path} (${target.branch}) (Y/n): `)).trim().toLowerCase();
  if (confirm === 'n' || confirm === 'no') { console.log('Отменено.'); process.exit(0); }
  await removeWorktree(target);
  console.log(COLORS.green('Удаление завершено.'));
}

async function removeWorktree(w) {
  console.log(COLORS.cyan(`→ Удаляем worktree ${w.path}`));
  // Проверка изменений
  try {
    const status = run('git status --porcelain', { cwd: w.path });
    if (status) {
      console.log(COLORS.yellow('Пропуск: есть незакоммиченные изменения.')); return;
    }
  } catch (e) {
    console.log(COLORS.yellow('Не удалось получить статус, продолжаем: ' + e.message));
  }
  // Удаляем worktree
  try {
    run(`git worktree remove "${w.path}"`);
  } catch (e1) {
    console.log(COLORS.yellow('Первая попытка git worktree remove не удалась: ' + e1.message));
    // Возможные причины: открытые файлы (IDE, watcher), антивирус / индексатор, дескриптор node_modules.
    // Попробуем форс.
    try {
      run(`git worktree remove -f "${w.path}"`);
      console.log(COLORS.dim('Удалено с флагом -f.'));
    } catch (e2) {
      console.log(COLORS.yellow('Повтор с -f не удался: ' + e2.message));
      // Попробуем git worktree prune (почистить сломанные записи), затем снова обычное удаление (на случай частичного состояния)
      try {
        run('git worktree prune');
      } catch {/* ignore */}
      try {
        run(`git worktree remove -f "${w.path}"`);
        console.log(COLORS.dim('Удалено после prune.'));
      } catch (e3) {
        console.log(COLORS.red('git worktree remove окончательно не удалось: ' + e3.message));
        // Диагностика: покажем несколько файлов внутри директории
        try {
          if (fs.existsSync(w.path)) {
            const sample = fs.readdirSync(w.path).slice(0, 10);
            console.log(COLORS.dim('Содержимое (первые 10 элементов): ' + sample.join(', ')));
          } else {
            console.log(COLORS.dim('Каталог уже отсутствует.'));
          }
        } catch {/* ignore */}
        console.log(COLORS.yellow('Fallback: пробуем ручное удаление каталога.'));
        let manualRemoved = false;
        try {
          if (fs.existsSync(w.path)) {
            fs.rmSync(w.path, { recursive: true, force: true });
            manualRemoved = true;
          }
        } catch (e4) {
          console.log(COLORS.red('Ручное удаление не удалось: ' + e4.message));
        }
        if (!manualRemoved) {
          console.log(COLORS.red('Не удалось удалить worktree. Возможно, каталог занят другим процессом. Закройте IDE/терминалы в этой папке и повторите.'));
          return; // прекращаем дальнейшие шаги (ветку не удаляем чтобы не оставить dangling state)
        }
      }
    }
  }
  // Удаляем директорию если осталась (нормальный путь, когда git worktree удалил ссылки, а файлы еще есть)
  try {
    if (fs.existsSync(w.path)) {
      fs.rmSync(w.path, { recursive: true, force: true });
    }
  } catch (e) {
    console.log(COLORS.yellow('Не удалось удалить директорию напрямую: ' + e.message));
  }
  // Пробуем удалить ветку если больше не используется
  if (w.branch && !['main','master','develop','dev'].includes(w.branch)) {
    try {
      const still = run('git worktree list');
      if (!still.includes(`[${w.branch}]`)) {
        // Проверим есть ли remote tracking
        try { run(`git branch -D "${w.branch}"`); console.log(COLORS.dim('Локальная ветка удалена.')); } catch (e) { console.log(COLORS.yellow('Не удалось удалить ветку: ' + e.message)); }
      }
    } catch {/* ignore */}
  }
}

main().catch(e => { console.error(COLORS.red(e.stack || e.message)); process.exit(1); });
