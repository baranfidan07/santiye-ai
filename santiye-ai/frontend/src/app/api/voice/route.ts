
import { NextRequest, NextResponse } from "next/server";
import { SpeechClient } from "@google-cloud/speech";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { PERSONAS } from "@/lib/personas";

// Initialize Google Cloud Clients
const speechClient = new SpeechClient({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
    }
});

const ttsClient = new TextToSpeechClient({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
    }
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get("audio") as Blob;
        const personaId = formData.get("persona") as string || "dedektif";
        const history = formData.get("history") as string;

        if (!audioFile) {
            return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
        }

        // 1. STT: Convert Audio to Text
        const arrayBuffer = await audioFile.arrayBuffer();
        const audioBytes = Buffer.from(arrayBuffer).toString("base64");

        const [sttResponse] = await speechClient.recognize({
            audio: { content: audioBytes },
            config: {
                encoding: "WEBM_OPUS",
                sampleRateHertz: 48000,
                languageCode: "tr-TR",
                alternativeLanguageCodes: ["en-US"],
                enableAutomaticPunctuation: true,
                model: "default"
            },
        });

        const userText = sttResponse.results
            ?.map(result => result.alternatives?.[0]?.transcript)
            .join("\n");

        if (!userText) {
            return NextResponse.json({ error: "Could not recognize speech" }, { status: 400 });
        }

        console.log("🗣️ User said:", userText);

        // 2. LLM: Get AI Response (Re-using logic from analyze route would be ideal, but for speed we call DeepSeek directly here or forward)
        // For simplicity and speed in this specific endpoint, we'll fetch the AI response.
        // Ideally, we import the logic or call the internal function. 
        // To avoid code duplication, let's assume we call the existing analyze/route logic or replicate the persona call.
        // BUT, since we need to keep this simple: Let's just do a quick fetch to our own /api/analyze if possible, or replicate the fetch.

        // Let's replicate the fetch to DeepSeek directly here for zero-latency turn-around
        const persona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];

        const deepSeekKey = process.env.DEEPSEEK_API_KEY;
        const messages = JSON.parse(history || "[]");
        messages.push({ role: "user", content: userText });

        const aiResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${deepSeekKey}`,
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: persona.systemPrompt.tr }, // Default to TR for voice for now
                    ...messages
                ],
                temperature: 1.1,
                max_tokens: 300 // Keep voice responses shorter
            })
        });

        const aiData = await aiResponse.json();
        let aiText = aiData.choices?.[0]?.message?.content || "Bir hata oluştu.";

        // Parse JSON if the AI returns JSON (as per our persona instruction)
        try {
            const parsed = JSON.parse(aiText);
            aiText = parsed.insight || aiText;
        } catch (e) {
            // Not JSON, use raw text
        }

        console.log("🤖 AI Replied:", aiText);

        // 3. TTS: SKIPPED (User preferred text-only response for now)
        // const [ttsResponse] = await ttsClient.synthesizeSpeech({ ... });
        // const audioBase64 = ttsResponse.audioContent?.toString("base64");

        return NextResponse.json({
            user_text: userText,
            ai_text: aiText,
            audio_base64: null // No audio output
        });

    } catch (error: any) {
        console.error("Voice Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
