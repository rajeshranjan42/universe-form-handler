const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Universal Form Handler...');

// Create directories
const dirs = [
    'uploads',
    'uploads/temp',
    'logs',
    'public/css',
    'public/js'
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    }
});

// Create .gitkeep files
const gitkeepFiles = [
    'uploads/.gitkeep',
    'logs/.gitkeep'
];

gitkeepFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '');
        console.log(`✅ Created: ${file}`);
    }
});

// Check .env file
if (!fs.existsSync('.env')) {
    console.log('⚠️  Please create .env file using .env.example as template');
}

console.log('✅ Setup completed!');
console.log('📝 Next steps:');
console.log('1. Copy .env.example to .env and fill in your details');
console.log('2. Run: npm start');
console.log('3. Test your forms!');
