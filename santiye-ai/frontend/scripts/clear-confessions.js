const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function clearRedditConfessions() {
    console.log("🧹 Wiping ALL confessions (Nuclear Option)...");

    // Delete everything where ID is not the nil UUID (effectively all rows)
    const { error, count } = await supabase
        .from('confessions')
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        console.error("❌ Error deleting:", error);
    } else {
        console.log(`✅ Deleted ${count} confessions.`);
        console.log("Database is clean. Ready for 'Mert' & 'Selin'.");
    }
}

clearRedditConfessions();
