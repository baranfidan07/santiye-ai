const fs = require('fs');
const path = require('path');

const pathsToCheck = [
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../../.env.local')
];

pathsToCheck.forEach(envPath => {
    console.log(`\nChecking path: ${envPath}`);
    if (fs.existsSync(envPath)) {
        console.log('File exists.');
        try {
            const content = fs.readFileSync(envPath, 'utf8');
            console.log('File content length:', content.length);
            const lines = content.split('\n');
            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || trimmed === '') return;
                const parts = trimmed.split('=');
                if (parts.length > 0) {
                    console.log(`Found Key: ${parts[0].trim()}`);
                }
            });
        } catch (err) {
            console.error('Error reading file:', err);
        }
    } else {
        console.log('File DOES NOT EXIST.');
    }
});
