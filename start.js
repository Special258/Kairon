const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '═════════════════════════════════════════════════════════');
console.log('\x1b[32m%s\x1b[0m', ' 🚀 Launching Kairon Platform (Backend + Frontend)');
console.log('\x1b[36m%s\x1b[0m', '═════════════════════════════════════════════════════════');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const pythonCmd = 'python';

// Start Python Backend
const backend = spawn(pythonCmd, ['-m', 'uvicorn', 'app.main:app', '--app-dir', 'backend', '--host', '127.0.0.1', '--port', '8000', '--reload'], {
  cwd: __dirname,
  shell: true,
  stdio: 'pipe'
});

backend.stdout.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log('\x1b[34m[Backend]\x1b[0m', line);
});

backend.stderr.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log('\x1b[33m[Backend]\x1b[0m', line);
});

// Start Frontend Dev Server
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: true,
  stdio: 'pipe'
});

frontend.stdout.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log('\x1b[32m[Frontend]\x1b[0m', line);
});

frontend.stderr.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log('\x1b[35m[Frontend]\x1b[0m', line);
});

backend.on('close', (code) => {
  console.log(`[Backend] Process exited with code ${code}`);
});

frontend.on('close', (code) => {
  console.log(`[Frontend] Process exited with code ${code}`);
});

function cleanup() {
  console.log('\n\x1b[31m%s\x1b[0m', 'Shutting down Kairon servers...');
  try { backend.kill(); } catch {}
  try { frontend.kill(); } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
