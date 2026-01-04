require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role to ensure permission

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking 'confessions' table...");
    const { data, error } = await supabase
        .from('confessions')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error selecting from confessions:", error);
    } else {
        if (data.length > 0) {
            console.log("Columns found based on first row keys:", Object.keys(data[0]));
        } else {
            console.log("Table is empty, cannot infer columns from data.");
            // Attempt to insert a dummy row to see an error or use an RPC if available to inspect schema
            // Or just try to select 'user_id' specifically
            const { error: colError } = await supabase.from('confessions').select('user_id').limit(1);
            if (colError) console.log("Select 'user_id' failed:", colError.message);
            else console.log("'user_id' column exists.");
        }
    }
}

checkSchema();
