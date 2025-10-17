const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Vybe Backend...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from .env.example...');
  fs.copyFileSync(path.join(__dirname, '.env.example'), envPath);
  console.log('✅ .env file created! Please update it with your configuration.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Check if Logo_To_Send.png exists
const logoPath = path.join(__dirname, 'assets', 'Logo_To_Send.png');
if (!fs.existsSync(logoPath)) {
  console.log('⚠️  Logo file missing!');
  console.log('Please add Logo_To_Send.png to backend/assets/ directory for email attachments.\n');
} else {
  console.log('✅ Logo file found.\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

console.log('🎉 Backend setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Update your .env file with database and email configuration');
console.log('2. Add Logo_To_Send.png to backend/assets/ directory');
console.log('3. Set up your PostgreSQL database');
console.log('4. Run "npm run dev" to start the development server');
console.log('\n💡 The backend will automatically create database tables on first run.');