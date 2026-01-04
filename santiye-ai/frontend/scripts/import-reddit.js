const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
require('dotenv').config({ path: '.env.local' });

// Configuration
// We only target relationship-focused communities now
const SUBREDDITS = ['relationship_advice', 'relationships', 'dating_advice', 'marriage'];
const LIMIT = 15;
const TIME_FILTER = 'week'; // 'week' allows for fresher viral content

// Initialize Clients
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com"
});

async function fetchRedditPosts(subreddit) {
    console.log(`Fetching top posts from r/${subreddit}...`);
    try {
        const response = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=${LIMIT}&t=${TIME_FILTER}`, {
            headers: {
                'User-Agent': 'AskAnalizBot/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Reddit API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data.children.map(child => child.data);
    } catch (error) {
        console.error("Error fetching Reddit:", error);
        return [];
    }
}

async function adaptContent(post) {
    console.log(`Adapting: "${post.title.substring(0, 30)}..."`);

    // Skip if text is removed or too short
    if (!post.selftext || post.selftext === '[removed]' || post.selftext === '[deleted]' || post.selftext.length < 150) {
        return null;
    }

    // STRICT TURKISH LOCALIZATION PROMPT
    const systemPrompt = `
    You are "Gossip Girl of Turkey". You take boring English relationship stories and turn them into VIRAL TURKISH CONFESSIONS (İtiraf).

    ### CRITICAL RULES (DO NOT IGNORE):
    1. 🇹🇷 **COMPLETE LOCALIZATION**:
       - **NAMES:** CHANGE ALL NAMES. "James" -> "Mert", "Sarah" -> "Selin", "Karen" -> "Buse". Never use English names.
       - **LOCATIONS:** "Walmart" -> "A101/BİM", "New York" -> "İstanbul/İzmir", "Pub" -> "Meyhane/Bar".
       - **CURRENCY:** $ -> TL (Adjust amounts to make sense in Turkey economy).

    2. 🗣️ **TONE: TURKISH TWITTER / EKSİ SÖZLÜK**:
       - Use slang: "Toksik", "Gaslighting", "Love bombing", "Vizyonsuzluk", "Rezalet".
       - Be emotional and dramatic. Like you are telling a secret to a close friend.
       - **NO GOOGLE TRANSLATE TURKISH**. It must sound natural, street-smart.

    3. 📝 **STRUCTURE**:
       - **Title:** Must be CLICKBAIT. (e.g., "Sevgilim beni en yakın arkadaşımla aldattı sandım ama olay başkaymış...")
       - **Content:** First person ("Ben"). 

    4. **FILTER**: If the story is NOT about a romantic relationship (e.g. boss, neighbor, mom), RETURN "null" (string).

    ### INPUT:
    Title: ${post.title}
    Body: ${post.selftext}

    ### OUTPUT JSON:
    {
        "title_tr": "SENSATIONAL TURKISH TITLE",
        "content_tr": "Full story in naturally flowing Turkish data...",
        "category": "İlişki | Aldatma | Flört | Toksik | Ayrılık",
        "toxic_score": 85,
        "vote_type": "stay_or_leave"
    }
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a Turkish content adapter. Output only JSON." },
                { role: "user", content: systemPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;

        // Handle rejection by AI
        if (content.includes("null") || content.length < 10) return null;

        const result = JSON.parse(content);

        // Final sanity check
        if (!result.title_tr || !result.content_tr) return null;

        return {
            ...result,
            original_title: post.title,
            original_url: `https://reddit.com${post.permalink}`,
            reddit_id: post.id,
            vote_type: result.vote_type || 'stay_or_leave', // Fallback
            category: result.category || 'İlişki'
        };
    } catch (error) {
        console.error("AI Adaptation Error:", error);
        return null;
    }
}

async function saveToSupabase(post) {
    // Check for duplicates
    const { data: existing } = await supabase
        .from('confessions')
        .select('id')
        .eq('source_url', post.original_url)
        .maybeSingle();

    if (existing) {
        console.log("Skipping: Already exists.");
        return;
    }

    const { error } = await supabase
        .from('confessions')
        .insert({
            content: `${post.title_tr}\n\n${post.content_tr}`,
            category: post.category,
            toxic_score: post.toxic_score,
            vote_type: post.vote_type,
            locale: 'tr',
            source_url: post.original_url,
            reddit_id: post.reddit_id,
            like_count: Math.floor(Math.random() * 50) + 5,
            dislike_count: Math.floor(Math.random() * 10)
        });

    if (error) console.error("Database Error:", error);
    else console.log("✅ Saved:", post.title_tr);
}

async function main() {
    console.log("🚀 Starting Reddit Import (Mert & Selin Edition)...");

    for (const sub of SUBREDDITS) {
        const posts = await fetchRedditPosts(sub);

        for (const post of posts) {
            // Random delay to avoid hitting rate limits
            await new Promise(r => setTimeout(r, 1500));

            if (post.stickied || post.is_video) continue;

            const adapted = await adaptContent(post);
            if (adapted) {
                await saveToSupabase(adapted);
            }
        }
    }

    console.log("🎉 Import Complete to AskAnaliz!");
}

main();
