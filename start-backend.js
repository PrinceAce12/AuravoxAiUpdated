#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Speech-to-Text Backend Server...');
console.log('📁 Working directory:', process.cwd());
console.log('📄 Server file:', path.join(process.cwd(), 'server.js'));

const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`\n🛑 Server stopped with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGTERM');
}); 