#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the project root directory
const PROJECT_ROOT = path.resolve(__dirname, '..');
process.chdir(PROJECT_ROOT);

// Determine the platform and script to use
const isWindows = process.platform === 'win32';
const scriptPath = isWindows ? 
    path.join(__dirname, 'start_windows.bat') : 
    path.join(__dirname, 'start_app.sh');

// Check if the appropriate script exists
if (!fs.existsSync(scriptPath)) {
    console.error(`❌ Script not found: ${scriptPath}`);
    process.exit(1);
}

// Execute the appropriate script
const command = isWindows ? 'cmd.exe' : 'bash';
const args = isWindows ? ['/c', scriptPath] : [scriptPath];

console.log(`🚀 Starting SignBridge using: ${command} ${scriptPath}`);

const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true
});

child.on('error', (error) => {
    console.error(`❌ Failed to start script: ${error.message}`);
    process.exit(1);
});

child.on('exit', (code) => {
    process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, terminating...');
    child.kill('SIGINT');
});
