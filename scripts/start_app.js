#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const PROJECT_ROOT = __dirname;

console.log('🚀 Starting SignBridge Application...');
console.log('📁 Project root:', PROJECT_ROOT);

// Start the backend first
const backendProcess = spawn('python', ['../backend/main.py'], {
    cwd: PROJECT_ROOT,
    stdio: 'pipe',
    shell: true,
    env: {
        ...process.env,
        GROQ_API_KEY: process.env.GROQ_API_KEY || ''
    }
});

// Wait a moment for backend to start
setTimeout(() => {
    // Start Electron in development mode
    const frontendProcess = spawn('npm', ['run', 'electron:dev'], {
        cwd: path.join(PROJECT_ROOT, 'frontend'),
        stdio: 'inherit',
        shell: true
    });

    // Handle process termination
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down SignBridge...');
        backendProcess.kill('SIGINT');
        frontendProcess.kill('SIGINT');
        process.exit(0);
    });

    frontendProcess.on('close', (code) => {
        console.log(`Frontend process exited with code ${code}`);
        backendProcess.kill('SIGINT');
        process.exit(code);
    });
}, 2000);

// Log backend output
backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
});

backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
});

backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
});

backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
});
