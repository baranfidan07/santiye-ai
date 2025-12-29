import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Model Configuration - Cost Optimized for Single-Shot Tasks
const MODEL_PRIMARY = "gpt-5-nano" as any;   // Ultra-fast, cheapest option
const MODEL_FALLBACK = "gpt-4o-mini" as any; // Reliable fallback

export async function POST(request: Request) {
    try {
        const { confession, confessionId } = await request.json();

        if (!confession || typeof confession !== 'string') {
            return NextResponse.json(
                { error: "Confession text is required" },
                { status: 400 }
            );
        }

        // Initialize Supabase client for caching
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Check if analysis already exists in database (cache hit)
        if (confessionId) {
            const { data: existing } = await supabase
                .from("confessions")
                .select("ai_analysis")
                .eq("id", confessionId)
                .single();

            if (existing?.ai_analysis) {
                return NextResponse.json({
                    analysis: existing.ai_analysis,
                    cached: true
                });
            }
        }

        // Initialize OpenAI
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { analysis: "🤖 AI analizi şu anda aktif değil.", cached: false },
                { status: 200 }
            );
        }

        // Optimized system prompt for single-shot analysis
        const systemPrompt = `Sen 'AskAnaliz' uygulamasının acımasız, biraz alaycı ve gerçekçi AI yorumcususun.
Gelen itirafı analiz et ve şu JSON formatında cevap ver:

{
    "toxicity_score": 0-100 (Ne kadar toksik/kırmızı bayrak var),
    "verdict_title": "Kısa 2-3 kelimelik başlık (Örn: 'Kırmızı Alarm 🚩', 'Klasik Oyun 🎭')",
    "short_comment": "Maksimum 1-2 cümlelik acımasız ama gerçekçi yorum",
    "emoji": "Durumu özetleyen tek emoji"
}

Üslubun: Zeki, biraz alaycı, gerçekçi. İlişki dinamiklerini iyi analiz et.
Manipülasyon, gaslighting, red flag tespit et.`;

        // Try primary model, fallback if needed
        let response;
        let usedModel = MODEL_PRIMARY;

        try {
            response = await openai.chat.completions.create({
                model: MODEL_PRIMARY,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Bu itirafı analiz et:\n\n${confession}` }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 150, // Cost optimization: Short punchlines only
            });
        } catch (modelError: any) {
            // Fallback to reliable model if gpt-5-nano is unavailable
            console.warn(`Model ${MODEL_PRIMARY} failed (${modelError.code || modelError.message}), falling back to ${MODEL_FALLBACK}`);
            usedModel = MODEL_FALLBACK;

            response = await openai.chat.completions.create({
                model: MODEL_FALLBACK,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Bu itirafı analiz et:\n\n${confession}` }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 150,
            });
        }

        const rawContent = response.choices[0]?.message?.content;

        if (!rawContent) {
            return NextResponse.json({
                analysis: "🤖 Analiz yapılamadı.",
                cached: false
            });
        }

        // Parse the structured response
        let parsedAnalysis;
        try {
            parsedAnalysis = JSON.parse(rawContent);
        } catch {
            // If JSON parsing fails, use raw content as analysis
            parsedAnalysis = { short_comment: rawContent };
        }

        // Format the final analysis string
        const formattedAnalysis = parsedAnalysis.emoji
            ? `${parsedAnalysis.emoji} ${parsedAnalysis.verdict_title || ''}\n\n${parsedAnalysis.short_comment}`
            : parsedAnalysis.short_comment || rawContent;

        // Cache the analysis in database
        if (confessionId) {
            await supabase
                .from("confessions")
                .update({
                    ai_analysis: formattedAnalysis,
                    toxic_score: parsedAnalysis.toxicity_score || 50
                })
                .eq("id", confessionId);
        }

        return NextResponse.json({
            analysis: formattedAnalysis,
            toxicity_score: parsedAnalysis.toxicity_score,
            verdict_title: parsedAnalysis.verdict_title,
            emoji: parsedAnalysis.emoji,
            model_used: usedModel,
            cached: false
        });

    } catch (error: any) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json(
            { analysis: "🤖 Analiz şu anda kullanılamıyor.", cached: false },
            { status: 200 }
        );
    }
}
