#!/usr/bin/env node
/*
 Автоматизация старта разработки задачи.
 Шаги:
 0. Интерактив: ввод краткого названия задачи, описания, имени ветки
 1. Создание git worktree (ветка от текущего origin/<baseBranch> или локальной текущей)
 2. Копирование .env* файлов (если есть .env.example → .env) в новую папку worktree
 3. pnpm install в worktree
 4. Добавление записи в plans/tasks.md (дата, ветка, описание)
 5. Запуск GitHub Copilot Chat CLI с моделью gpt-5 и промптом как текст задачи
 6. Открытие VS Code в worktree и финальное сообщение

 Дополнительно:
	- Проверка наличия незакоммиченных изменений (предупреждение)
	- Безопасная отмена при ошибках
	- Цветной лог
*/

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');

// ---- Helpers ----
const COLORS = {
	green: (s)=>`\x1b[32m${s}\x1b[0m`,
	yellow: (s)=>`\x1b[33m${s}\x1b[0m`,
	red: (s)=>`\x1b[31m${s}\x1b[0m`,
	cyan: (s)=>`\x1b[36m${s}\x1b[0m`,
	magenta: (s)=>`\x1b[35m${s}\x1b[0m`,
	dim: (s)=>`\x1b[2m${s}\x1b[0m`,
};

function run(cmd, options={}) {
	const start = Date.now();
	log(COLORS.dim(`→ ${cmd}`));
	const out = execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...options });
	log(COLORS.dim(`✔ (${((Date.now()-start)/1000).toFixed(2)}s)`));
	return out.trim();
}

function log(msg){ console.log(msg); }
function error(msg){ console.error(COLORS.red(msg)); }
function section(title){
	log('\n'+COLORS.cyan('▸ '+title)+'\n');
}

function sanitizeBranchName(name){
	return name
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9-_\/]+/g,'-')
		.replace(/--+/g,'-')
		.replace(/^-+|-+$/g,'')
		.slice(0,80) || 'task';
}

function nowISODate(){ return new Date().toISOString().slice(0,10); }

async function ask(questions){
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	const answers = {};
	for (const q of questions){
		answers[q.name] = await new Promise(res => rl.question(q.message, ans => res(ans || q.default || '')));
	}
	rl.close();
	return answers;
}

function detectBaseBranch(){
	try {
		const current = run('git rev-parse --abbrev-ref HEAD');
		if (['main','master','develop','dev'].includes(current)) return current;
		// попробуем main или develop в remotes
		const branches = run('git branch --format="%(refname:short)"');
		if (branches.includes('main')) return 'main';
		if (branches.includes('develop')) return 'develop';
		return current; // fallback
	} catch { return 'main'; }
}

function ensureCleanWorktreeWarn(){
	try {
		const status = run('git status --porcelain');
		if (status) {
			log(COLORS.yellow('⚠ Внимание: у вас есть незакоммиченные изменения. Они не попадут в новую ветку автоматически.'));
		}
	} catch (e){
		error('Не удалось проверить статус git: '+e.message);
	}
}

function copyEnvFiles(targetDir){
	const root = process.cwd();
	const candidates = fs.readdirSync(root).filter(f => f.startsWith('.env'));
	if (candidates.length===0 && fs.existsSync(path.join(root,'.env.example'))){
		candidates.push('.env.example');
	}
	for (const f of candidates){
		const src = path.join(root,f);
		let destName = f;
		if (f === '.env.example') destName = '.env';
		const dest = path.join(targetDir,destName);
		if (!fs.existsSync(dest)){
			fs.copyFileSync(src,dest);
			log('  скопирован '+f+' → '+path.relative(root,dest));
		}
	}
}

function appendTaskRecord({ branch, title, description }){
	const plansDir = path.join(process.cwd(),'plans');
	if (!fs.existsSync(plansDir)) fs.mkdirSync(plansDir,{recursive:true});
	const file = path.join(plansDir,'tasks.md');
	const date = nowISODate();
	const block = `\n${date}\nВетка: ${branch}\n\n${description}\n`;
	fs.appendFileSync(file, block, 'utf8');
	log('Запись добавлена в plans/tasks.md');
}

function tryLaunchCopilot({ prompt, worktreePath }){
	try {
		// Проверим доступность команды copilot.
		run('copilot --version');
	} catch { 
		log(COLORS.yellow('GitHub copilot отсутствует или недоступен, пропускаю шаг Copilot.'));
		return; 
	}
	try {
		const args = ['--model','gpt-5','-p', prompt, '--allow-all-tools'];
		log(COLORS.magenta('Запуск Copilot...'));
		const proc = spawn('copilot', args, { stdio: 'inherit', cwd: worktreePath, shell: false });
		proc.on('exit', code => {
			if (code !== 0) error('Copilot завершился с кодом '+code);
		});
	} catch(e){
		error('Не удалось запустить Copilot: '+e.message);
	}
}

async function main(){
	section('Интерактивный ввод');
	const baseBranch = detectBaseBranch();
		const answers = await ask([
				{ name: 'description', message: 'Описание задачи: ' },
				{ name: 'branch', message: `Имя ветки (enter чтобы сгенерировать): ` }
		]);

			let { description, branch } = answers;
	if (!description){
		// собрать многострочный ввод до пустой строки
		description = await new Promise(resolve => {
			const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
			let lines = [];
			const askLine = () => rl.question('', line => {
				if (!line) { rl.close(); resolve(lines.join('\n')); return; }
				lines.push(line); askLine();
			});
			log(COLORS.dim('Введите описание построчно, пустая строка — конец:'));
			askLine();
		});
	}
		// Первая непустая строка описания = heading
		const firstLine = (description.split(/\r?\n/).find(l=>l.trim()) || '').trim();
		const heading = firstLine || 'Без названия';
		const autoBranch = sanitizeBranchName(`task/${nowISODate()}-${heading.replace(/\s+/g,'-')}`);
		branch = sanitizeBranchName(branch || autoBranch);
	const worktreeDirName = branch.replace(/[\/]/g,'__'); // каталог под worktrees
	const worktreesRoot = path.join(process.cwd(),'..');
	const worktreePath = path.join(worktreesRoot, worktreeDirName);

	section('Проверки');
	ensureCleanWorktreeWarn();
	try { run('git rev-parse --is-inside-work-tree'); } catch { throw new Error('Не git репозиторий'); }
	// Обновляем ремоуты
	try { run('git fetch --all --prune'); } catch (e){ error('fetch не удался: '+e.message); }

	section('Создание worktree');
	if (fs.existsSync(worktreePath)) throw new Error('Каталог уже существует: '+worktreePath);
	try {
		// если ветка не существует — создаём от baseBranch
		const branches = run('git branch --list');
		const remoteBranches = run('git branch -r');
		const existsLocal = branches.split('\n').some(l=>l.replace('*','').trim()===branch);
		const existsRemote = remoteBranches.split('\n').some(l=>l.trim().endsWith('/'+branch));
		if (!existsLocal && !existsRemote){
			run(`git worktree add "${worktreePath}" -b "${branch}" "${baseBranch}"`);
		} else {
			run(`git worktree add "${worktreePath}" "${branch}"`);
		}
	} catch(e){
		error('Не удалось создать worktree: '+e.message);
		process.exit(1);
	}

	section('Копирование env файлов');
	copyEnvFiles(worktreePath);

	section('Установка зависимостей (pnpm install)');
	try { run('pnpm install', { cwd: worktreePath }); }
	catch(e){ error('pnpm install завершился ошибкой: '+e.message); }

	section('Запись задачи');
		appendTaskRecord({ branch, title: heading, description });

			const copilotPrompt = '"' + description + '\n @/plans/Техническое описание системы.md"';
			section('Copilot Chat');
			tryLaunchCopilot({ prompt: copilotPrompt, worktreePath });

	section('Открытие VS Code');
	try {
		const codeCmd = process.platform === 'win32' ? 'code.cmd' : 'code';
		spawn(codeCmd, [worktreePath], { stdio: 'ignore', detached: true });
	} catch(e){ error('Не удалось открыть VS Code: '+e.message); }

	log('\n'+COLORS.green('Готово!')+' Рабочая директория: '+COLORS.magenta(worktreePath));
	log('Ветка: '+branch);
}

main().catch(e=>{ error(e.stack||e.message); process.exit(1); });
