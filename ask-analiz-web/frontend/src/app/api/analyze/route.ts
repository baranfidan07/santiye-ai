import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { getPersonaById, PersonaType } from "@/lib/personas";

export const maxDuration = 60;

// DeepSeek Configuration - High Intelligence, Low Cost
const MODEL_MAIN = "deepseek-chat";

export async function POST(req: Request) {
    const client = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: "https://api.deepseek.com",
    });

    try {
        const body = await req.json();
        const { messages, persona = 'dedektif', language = 'tr', mood } = body;

        if (!messages) {
            return NextResponse.json({ error: "Messages are required" }, { status: 400 });
        }

        // Get the persona config
        const personaConfig = getPersonaById(persona as PersonaType);

        // Select prompt based on language, fallback to 'tr' if missing or invalid
        let systemPrompt = (personaConfig.systemPrompt as any)[language] || personaConfig.systemPrompt['tr'] || "You are a helpful assistant.";

        // Add mood-specific instructions for taktik persona
        if (persona === 'taktik' && mood) {
            const moodInstructions: Record<string, string> = {
                cesur: language === 'tr'
                    ? '\n\n🎭 MOOD: CESUR/BOLD - Kullanıcı cesur ve kendinden emin mesajlar istiyor. Doğrudan, flörtöz ve özgüvenli yanıtlar üret.'
                    : '\n\n🎭 MOOD: BOLD - User wants confident, direct messages. Generate flirty, assertive replies.',
                cool: language === 'tr'
                    ? '\n\n🎭 MOOD: COOL/CHILL - Kullanıcı rahat, umursamaz tarzda mesajlar istiyor. Fazla ilgili görünmeden havalı ol.'
                    : '\n\n🎭 MOOD: CHILL - User wants relaxed, unbothered messages. Be cool without seeming too eager.',
                toxic: language === 'tr'
                    ? '\n\n🎭 MOOD: TOXIC/MYSTERIOUS - Kullanıcı gizemli, biraz toxic mesajlar istiyor. Push-pull taktiği kullan.'
                    : '\n\n🎭 MOOD: TOXIC - User wants mysterious, slightly toxic messages. Use push-pull tactics.',
                romantik: language === 'tr'
                    ? '\n\n🎭 MOOD: ROMANTİK - Kullanıcı tatlı, romantik mesajlar istiyor. Samimi ve sevgi dolu ol.'
                    : '\n\n🎭 MOOD: ROMANTIC - User wants sweet, romantic messages. Be genuine and affectionate.'
            };
            systemPrompt += moodInstructions[mood] || '';
        }

        // Count user messages to determine turn number (only for dedektif)
        const userMessageCount = messages.filter((m: any) => m.role === 'user').length;
        const isFinalTurn = userMessageCount >= 3;

        // Only add turn info for dedektif persona - taktik should always give direct answers
        let turnInfo = '';
        const mode = body.mode || 'full';

        if (persona === 'dedektif') {
            turnInfo = `\n\n### CURRENT TURN INFO:\nThis is user message #${userMessageCount}. ${isFinalTurn ? '⚠️ THIS IS THE FINAL TURN - YOU MUST GIVE VERDICT NOW!' : `You can ask ${3 - userMessageCount} more question(s) maximum.`}`;

            if (isFinalTurn && mode === 'mini') {
                turnInfo += `\n\n🚫 GUEST MODE RESTRICTION (CRITICAL):
                - You are in "Teaser Mode". You MUST NOT give the full analysis.
                - Output ONLY:
                  1. A short, vague 1-sentence summary of the situation (e.g. "This situation shows classics signs of manipulation.")
                  2. The Risk Score.
                - DO NOT list bullet points. DO NOT give advice. DO NOT explain "Why".
                - Your goal is to make them curious, not satisfied.
                - End exactly with: "Detaylı risk raporu ve tavsiyeler sadece üyelere özel. (Giriş Yapın)"`;
            } else if (isFinalTurn && mode === 'full') {
                turnInfo += "\n\n💎 FULL MODE (DOUBLE SATISFACTION): \n- Give your detailed analysis and verdict first (Satisfy the user).\n- THEN, add a 'Skeptic Twist': Mention that while you are 85% sure, there is a possibility of misunderstanding or gender bias in the story.\n- EXPLICITLY RECOMMEND asking the 'Jury' to be sure.\n- Phrase it like: 'Benim işlemcim X diyor ama sokağın kanunu farklı olabilir. Bence bunu Jüri'ye sor, çok farklı tepkiler gelebilir.'";
            }
        } else if (persona === 'taktik') {
            // Taktik has 2-turn flow: first ask clarifying questions, then give replies
            const isTaktikFinal = userMessageCount >= 2;
            turnInfo = isTaktikFinal
                ? `\n\n⚠️ ARTIK YETERLİ BİLGİN VAR! Soru sorma, direkt 1 adet (Guest Mode) öneri ver.`
                : `\n\n📝 Bu kullanıcının ilk mesajı. Durumu anlamak için 1-2 kısa soru sor.`;

            if (isTaktikFinal && mode === 'mini') {
                turnInfo += "\n\n🔒 GUEST MODE: Provide ONLY 1 reply option. Do not give alternatives. Mention 'Login for more options'.";
            }
        }

        const fullMessages = [
            { role: "system", content: systemPrompt + turnInfo },
            ...messages
        ];

        // Non-streaming request with JSON mode
        const response = await client.chat.completions.create({
            model: MODEL_MAIN,
            messages: fullMessages,
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;

        if (!content) {
            throw new Error("No content returned from DeepSeek");
        }

        const result = JSON.parse(content);

        // [BUGFIX] Sanitize AI output for hallucinations like "undefined" suffix
        // Clean all string fields recursively
        const sanitizeUndefined = (obj: any): any => {
            if (typeof obj === 'string') {
                // Remove 'undefined' at end of string (with or without space/punctuation before)
                return obj.replace(/[!.?,;:\s]*undefined\s*$/gi, '').trim();
            }
            if (Array.isArray(obj)) {
                return obj.map(sanitizeUndefined);
            }
            if (obj && typeof obj === 'object') {
                const cleaned: any = {};
                for (const key in obj) {
                    cleaned[key] = sanitizeUndefined(obj[key]);
                }
                return cleaned;
            }
            return obj;
        };

        const cleanedResult = sanitizeUndefined(result);

        // Enrich with persona-specific score metadata if not already present
        if (!cleanedResult.score_data && cleanedResult.confidence_score !== undefined) {
            cleanedResult.score_data = {
                value: cleanedResult.confidence_score,
                label: personaConfig.scoreConfig.label,
                color: personaConfig.scoreConfig.color
            };
        }

        // Pass through intent and triggers
        // (No change needed since we pass the whole cleanedResult object, but confirming logic)

        return NextResponse.json(cleanedResult);

    } catch (error: any) {
        console.error("Error in analyze route:", error);
        return NextResponse.json(
            { risk_score: 50, insight: `Analiz hatası: ${error.message}.` },
            { status: 500 }
        );
    }
}
