require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', url ? 'Found' : 'Missing');
console.log('Key:', key ? 'Found' : 'Missing');

if (!url || !key) {
    console.error('Keys are missing. Cannot test.');
    process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
    const { data, error } = await supabase.from('confessions').select('*').limit(1);
    if (error) {
        console.error('Connection Failed:', error.message);
    } else {
        console.log('Connection Successful!');
        console.log('Data count:', data.length);
    }
}

test();
