/**
 * Unified Development Runner for BusinessOS AI
 * Launches FastAPI Backend (port 8000) and Next.js Frontend (port 3000) concurrently.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

const isWindows = process.platform === 'win32';

// 1. Locate working Python executable
function findPythonExecutable() {
  const candidates = isWindows
    ? [
        path.join(backendDir, '.venv_fresh', 'Scripts', 'python.exe'),
        path.join(backendDir, '.venv', 'Scripts', 'python.exe'),
        path.join(backendDir, 'venv', 'Scripts', 'python.exe'),
        'python',
        'py'
      ]
    : [
        path.join(backendDir, '.venv_fresh', 'bin', 'python'),
        path.join(backendDir, '.venv', 'bin', 'python'),
        path.join(backendDir, 'venv', 'bin', 'python'),
        'python3',
        'python'
      ];

  for (const candidate of candidates) {
    if (candidate.includes(path.sep)) {
      if (fs.existsSync(candidate)) {
        try {
          execSync(`"${candidate}" -c "import fastapi, uvicorn"`, { stdio: 'ignore' });
          return candidate;
        } catch {
          // continue checking
        }
      }
    } else {
      try {
        execSync(`${candidate} -c "import fastapi, uvicorn"`, { stdio: 'ignore' });
        return candidate;
      } catch {
        // continue checking
      }
    }
  }

  // Fallback to first existing virtualenv python or 'python'
  for (const candidate of candidates) {
    if (candidate.includes(path.sep) && fs.existsSync(candidate)) return candidate;
  }
  return isWindows ? 'python' : 'python3';
}

const pythonExe = findPythonExecutable();

console.log('\x1b[1m\x1b[34m====================================================\x1b[0m');
console.log('\x1b[1m\x1b[36m   BusinessOS AI — Authoritative Enterprise Engine   \x1b[0m');
console.log('\x1b[1m\x1b[34m====================================================\x1b[0m');
console.log(`\x1b[32m[Runtime]\x1b[0m Python Engine: ${pythonExe}`);
console.log(`\x1b[32m[Backend]\x1b[0m FastAPI API:   http://127.0.0.1:8000/api/v1`);
console.log(`\x1b[32m[Docs]\x1b[0m    Swagger UI:    http://127.0.0.1:8000/docs`);
console.log(`\x1b[32m[Frontend]\x1b[0m Next.js App:  http://localhost:3000`);
console.log('\x1b[1m\x1b[34m----------------------------------------------------\x1b[0m\n');

const args = process.argv.slice(2);
const backendOnly = args.includes('--backend-only');
const frontendOnly = args.includes('--frontend-only');

const runningProcesses = [];

function pipeOutput(proc, prefix, color) {
  if (proc.stdout) {
    proc.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          console.log(`${color}${prefix}\x1b[0m ${line}`);
        }
      }
    });
  }

  if (proc.stderr) {
    proc.stderr.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          console.error(`${color}${prefix}\x1b[0m ${line}`);
        }
      }
    });
  }
}

// Start Backend
if (!frontendOnly) {
  const backendProc = spawn(
    pythonExe,
    ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'],
    {
      cwd: backendDir,
      shell: false,
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    }
  );

  pipeOutput(backendProc, '[FastAPI]', '\x1b[36m');
  runningProcesses.push(backendProc);

  backendProc.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.log(`\x1b[31m[FastAPI] Backend exited with code ${code}\x1b[0m`);
    }
  });
}

// Start Frontend
if (!backendOnly) {
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  const frontendProc = spawn(npmCmd, ['run', 'dev'], {
    cwd: frontendDir,
    shell: isWindows,
    env: { ...process.env, PORT: '3000' }
  });

  pipeOutput(frontendProc, '[Next.js]', '\x1b[35m');
  runningProcesses.push(frontendProc);

  frontendProc.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.log(`\x1b[31m[Next.js] Frontend exited with code ${code}\x1b[0m`);
    }
  });
}

function cleanup() {
  console.log('\n\x1b[33mShutting down BusinessOS AI services...\x1b[0m');
  for (const proc of runningProcesses) {
    try {
      if (isWindows && proc.pid) {
        execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
      } else {
        proc.kill('SIGINT');
      }
    } catch {
      // already exited
    }
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
