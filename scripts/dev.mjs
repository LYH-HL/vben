// 一键启动：后端（3001）+ 前端（5173），Ctrl+C 一起退出。
//
// 不用 concurrently 之类的额外依赖，也不走 .cmd 包装器：
// 两个子进程都用当前 node 直接执行 JS 入口，Windows / macOS / Linux 行为一致。
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// 后端依赖 server/.env 里的 JWT_SECRET，缺了会直接拒绝启动，先提醒一句
const envFile = path.join(root, 'server', '.env');
if (!existsSync(envFile)) {
  console.warn('[dev] 警告：找不到 server/.env，后端会因缺少 JWT_SECRET 拒绝启动。');
  console.warn('      请执行：copy server\\.env.example server\\.env  然后填入密钥。');
}

const children = [];
let shuttingDown = false;

function start(label, args) {
  const child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit' });
  children.push(child);

  child.on('error', (error) => {
    console.error(`[dev:${label}] 启动失败：${error.message}`);
    shutdown(1);
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    // 任何一个先挂了就把另一个也收掉，避免留下半套服务让人误判
    console.log(`[dev:${label}] 已退出（code=${code ?? 'null'}, signal=${signal ?? 'null'}）`);
    shutdown(code ?? 1);
  });

  return child;
}

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill();
      } catch {
        // 已经退出的进程忽略
      }
    }
  }
  // 给子进程一点时间收尾，再退出自己
  setTimeout(() => process.exit(code), 300);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('[dev] 启动后端 http://localhost:3001 与前端 http://localhost:5173 ...');

start('server', [path.join(root, 'server', 'index.js')]);
start('web', [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')]);
