import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Configuration Error: API Key missing" }, { status: 500 });
        }

        const systemPrompt = `GÖREV: Bu konuşma geçmişine dayanarak "Bir Derdim Var" / İtiraf tarzında anonim bir metin yaz.
        
        KURALLAR:
        1. İSİMLERİ SİL: "Ahmet", "Ayşe" yerine "Sevgilim", "Eski flörtüm" kullan.
        2. MEKANLARI SİL: "Kadıköy", "Okul" yerine "Buluştuğumuz yer", "Kampüs" kullan.
        3. DRAMATİK VE KISA OLSUN: Twitter/Reels tarzı, okuyan hemen ilgilensin. Макs 280 karakter.
        4. ODAK: Olayın garipliği veya toksikliği olsun.
        5. SAMİMİ DİL: Sanki en yakın arkadaşına anlatıyor gibi.
        
        ÇIKTI FORMATI:
        Sadece oluşacak metni ver. Başka hiçbir şey yazma.`;

        // Reformulate messages for DeepSeek
        // We only really need the simplified conversation history
        const deepseekMessages = [
            { role: "system", content: systemPrompt },
            ...messages.map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            }))
        ];

        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: deepseekMessages,
                temperature: 0.7,
                max_tokens: 300
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("DeepSeek API Error:", errText);
            throw new Error(`DeepSeek API Error: ${response.status} ${errText}`);
        }

        const data = await response.json();
        const confessionText = data.choices?.[0]?.message?.content || "İçerik oluşturulamadı.";

        return NextResponse.json({ confession_text: confessionText });
    } catch (error: any) {
        console.error("Generate Confession Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
