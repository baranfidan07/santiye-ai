const fs = require('fs');
const path = require('path');

const content = `NEXT_PUBLIC_SUPABASE_URL=https://gpjgktourvedkjmonjwl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwamdrdG91cnZlZGtqbW9uandsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDQ3NTgsImV4cCI6MjA4MTMyMDc1OH0.TWOc5b-3VsGna9cRYFQYPVWhmi6GW76T_QtAAmJl4_0`;

const filePath = path.resolve(__dirname, '../.env.local');

try {
    fs.writeFileSync(filePath, content.trim());
    console.log('Successfully wrote .env.local');
} catch (err) {
    console.error('Error writing file:', err);
}
