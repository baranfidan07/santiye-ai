import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { getPersonaById, PersonaType } from "@/lib/personas";

export const maxDuration = 60;

// DeepSeek Configuration
const MODEL_MAIN = "deepseek-chat";

export async function POST(req: Request) {
    const client = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: "https://api.deepseek.com",
    });

    try {
        const body = await req.json();
        const { messages, persona = 'dedektif', language = 'tr', mood } = body;

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: "Messages are required" }, { status: 400 });
        }

        // STEP 1: ISOLATE LAST USER MESSAGE FOR CLASSIFICATION
        const lastMessage = messages[messages.length - 1];
        const lastUserMessage = lastMessage.content;

        // STEP 2: THE DIRECTOR AGENT (STATELESS DECISION MAKER)
        // CRITICAL FIX: We pass ONLY the last message. No history.
        // This prevents "Context Inertia" (where old messages force the model into Detective mode).
        const directorResponse = await client.chat.completions.create({
            model: MODEL_MAIN,
            messages: [
                {
                    role: "system",
                    content: `You are the CAUSEWAY DIRECTOR. Route the input to the correct Actor.
                    
                    ACTORS:
                    1. [ACTOR_TRASH]: Random typing like "asdasd", "123123", empty, or total nonsense without meaning.
                    2. [ACTOR_FRIEND]: "Naber", "Nasılsın", "How are you", "Wassup", "Kimsin". (Casual Chitchat).
                    3. [ACTOR_DETECTIVE]: EVERYTHING ELSE. Complaints ("İlişkim kötü"), Stories, Love problems, Venting, Questions.
                    
                    OUTPUT JSON: {"actor": "ACTOR_TRASH" | "ACTOR_FRIEND" | "ACTOR_DETECTIVE"}`
                },
                { role: "user", content: lastUserMessage } // ONLY LAST MESSAGE
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
        });

        // ROBUST PARSING HELPER
        const parseJSON = (str: string) => {
            try {
                // Remove code blocks
                const diff = str.replace(/```json\n?|```/g, '').trim();
                return JSON.parse(diff);
            } catch (e) {
                return {};
            }
        };

        const directorDecision = parseJSON(directorResponse.choices[0].message.content || "{}");
        const selectedActor = directorDecision.actor || "ACTOR_DETECTIVE";

        const debugInfo = {
            input: lastUserMessage.substring(0, 50),
            actor: selectedActor,
            forced_prompt: false
        };

        // STEP 3: ACTOR EXECUTION

        // === ACTOR: TRASH ===
        if (selectedActor === 'ACTOR_TRASH') {
            return NextResponse.json({
                intent: 'TRASH',
                insight: "Bu ne oğlum analiz yapmayacak mıyız? Düzgün bir hikaye anlat bari.",
                question: null,
                confidence_score: 0,
                debug_info: debugInfo
            });
        }

        // === ACTOR: FRIEND ===
        if (selectedActor === 'ACTOR_FRIEND') {
            const friendResponse = await client.chat.completions.create({
                model: MODEL_MAIN,
                messages: [
                    {
                        role: "system",
                        content: `You are a Chill Guy. 
                        - Speak briefly and coolly.
                        - Do NOT act like a detective. 
                        - Just reply to the greeting/question naturally.
                        - Match the user's language (Turkish or English).`
                    },
                    { role: "user", content: lastUserMessage } // ZERO HISTORY
                ],
                temperature: 0.7,
            });

            return NextResponse.json({
                intent: 'CHITCHAT',
                insight: friendResponse.choices[0].message.content,
                question: null,
                confidence_score: 100,
                debug_info: debugInfo
            });
        }

        // === ACTOR: DETECTIVE (ORIGINAL LOGIC) ===
        // Only if selectedActor === 'ACTOR_DETECTIVE'

        const personaConfig = getPersonaById(persona as PersonaType);
        let systemPrompt = (personaConfig.systemPrompt as any)[language] || personaConfig.systemPrompt['tr'] || "You are a helpful assistant.";

        if (persona === 'taktik' && mood) {
            const moodInstructions: Record<string, string> = {
                cesur: language === 'tr' ? '\n\n🎭 MOOD: CESUR - Özgüvenli ol.' : '\n\n🎭 MOOD: BOLD - Be confident.',
                cool: language === 'tr' ? '\n\n🎭 MOOD: COOL - Umursamaz ol.' : '\n\n🎭 MOOD: CHILL - Be unbothered.',
                toxic: language === 'tr' ? '\n\n🎭 MOOD: TOXIC - Manipülatif ol.' : '\n\n🎭 MOOD: TOXIC - Be manipulative.',
                romantik: language === 'tr' ? '\n\n🎭 MOOD: ROMANTİK - Romantik ol.' : '\n\n🎭 MOOD: ROMANTIC - Be romantic.'
            };
            systemPrompt += moodInstructions[mood] || '';
        }

        // INJECTION FOR DEBUGGING
        if (process.env.NODE_ENV === 'development') {
            systemPrompt = "[DEBUG: DETECTIVE MODE ACTIVE] " + systemPrompt;
            debugInfo.forced_prompt = true;
        }

        const fullMessages = [
            { role: "system", content: systemPrompt },
            ...messages,
        ];

        const response = await client.chat.completions.create({
            model: MODEL_MAIN,
            messages: fullMessages,
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content");

        const result = parseJSON(content);

        const sanitizeUndefined = (obj: any): any => {
            if (typeof obj === 'string') return obj.replace(/[!.?,;:\s]*undefined\s*$/gi, '').trim();
            if (Array.isArray(obj)) return obj.map(sanitizeUndefined);
            if (obj && typeof obj === 'object') {
                const cleaned: any = {};
                for (const key in obj) cleaned[key] = sanitizeUndefined(obj[key]);
                return cleaned;
            }
            return obj;
        };

        const cleanedResult = sanitizeUndefined(result);

        if (!cleanedResult.score_data && cleanedResult.confidence_score !== undefined) {
            cleanedResult.score_data = {
                value: cleanedResult.confidence_score,
                label: personaConfig.scoreConfig.label,
                color: personaConfig.scoreConfig.color
            };
        }

        cleanedResult.debug_info = debugInfo;

        return NextResponse.json(cleanedResult);

    } catch (error: any) {
        console.error("Error in analyze route:", error);
        return NextResponse.json(
            { risk_score: 50, insight: `Analiz hatası: ${error.message}.` },
            { status: 500 }
        );
    }
}
