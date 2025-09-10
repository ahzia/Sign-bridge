#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the project root directory
const PROJECT_ROOT = path.resolve(__dirname, '..');
const frontendDir = path.join(PROJECT_ROOT, 'frontend');

console.log('🚀 Building SignBridge for production with Electron...');

// Build the frontend first
console.log('📦 Building frontend...');
const buildFrontend = spawn('npm', ['run', 'build:frontend'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true
});

buildFrontend.on('error', (error) => {
    console.error(`❌ Failed to build frontend: ${error.message}`);
    process.exit(1);
});

buildFrontend.on('exit', (code) => {
    if (code !== 0) {
        console.error(`❌ Frontend build failed with code ${code}`);
        process.exit(code);
    }
    
    console.log('✅ Frontend build completed');
    
    // Now build the Electron app
    console.log('📦 Building Electron app...');
    const buildElectron = spawn('npm', ['run', 'build'], {
        cwd: frontendDir,
        stdio: 'inherit',
        shell: true
    });

    buildElectron.on('error', (error) => {
        console.error(`❌ Failed to build Electron app: ${error.message}`);
        process.exit(1);
    });

    buildElectron.on('exit', (code) => {
        if (code !== 0) {
            console.error(`❌ Electron build failed with code ${code}`);
            process.exit(code);
        }
        
        console.log('✅ Electron app build completed successfully!');
        console.log('📁 Output directory: frontend/dist-electron');
    });
});

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, terminating...');
    buildFrontend.kill('SIGINT');
    process.exit(1);
});
