import { NextRequest, NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

// Initialize Vertex AI
const vertexAI = new VertexAI({
    project: process.env.GOOGLE_PROJECT_ID,
    location: 'us-central1', // Vertex AI models are often centrally located
    googleAuthOptions: {
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }
    }
});

// Use the user-requested model
// Note: Exact model ID might vary. Trying the standard convention for the requested model.
// Use a known stable model for debugging, then switch back to 2.5 if verified
// const modelId = "gemini-2.5-flash-lite-001"; 
const modelId = "gemini-1.5-flash-001";

export async function POST(req: NextRequest) {
    try {
        const { gsUri, personaSystemPrompt } = await req.json();
        console.log("Vision Analiz Başlıyor for:", gsUri);

        if (!gsUri) {
            console.error("Vision API Error: No GS URI received.");
            return NextResponse.json({ error: "No image URI provided" }, { status: 400 });
        }

        console.log("Vision API Request Received. URI:", gsUri);
        console.log("Persona Prompt Length:", personaSystemPrompt?.length);

        const generativeModel = vertexAI.getGenerativeModel({
            model: modelId,
            systemInstruction: "You are an expert image analyst. You MUST analyze the visible text, UI elements, and context in the image provided."
        });

        // Simpler prompt to reduce model confusion
        const vertexPrompt = `
        ${personaSystemPrompt || ''}
        
        🚧 OVERRIDE PROTOCOL: VISION ANALYSIS 🚧
        You are in "Visual Evidence Mode". 
        
        CRITICAL RULE BREAK:
        - IGNORE any instructions to "Ask a question" or "Wait for more info".
        - An image has been provided. This IS the evidence.
        - DO NOT ask "What is in the story?". LOOK AT THE IMAGE and tell me.
        - Extract every piece of text, time, and detail from the screenshot.
        - Provide a FINAL VERDICT immediately based on the visual evidence.
        
        TASK:
        1. Describe exactly what is in the screenshot (flirtatious text? story view? like?).
        2. Apply the persona's Toxic/Paranoid logic to THIS visual evidence.
        
        OUTPUT FORMAT (JSON):
        {
            "insight": "DIRECT ANALYSIS OF IMAGE: [What you see] + [Interpretation]. No questions.",
            "confidence_score": 95,
            "risk_score": 80,
            "intent": "JUDGMENT",
            "action_trigger": null
        }
        `;

        const request = {
            contents: [{
                role: 'user',
                parts: [
                    {
                        fileData: {
                            fileUri: gsUri,
                            mimeType: 'image/png',
                        }
                    },
                    { text: vertexPrompt }
                ]
            }],
        };

        const result = await generativeModel.generateContent(request);
        const responseResponse = await result.response;
        const candidates = responseResponse?.candidates;
        let text = candidates?.[0]?.content?.parts?.[0]?.text;

        console.log("Vertex Raw Response:", text);

        if (!text) throw new Error("No response content from Vertex AI");

        // Clean markdown code blocks if present
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const json = JSON.parse(text);
            return NextResponse.json(json);
        } catch (e) {
            console.error("JSON Parse Error, returning raw text:", text);
            return NextResponse.json({
                insight: text,
                risk_score: 50,
                confidence_score: 50
            });
        }

    } catch (error: any) {
        console.error("Vertex AI Vision Error:", error);

        if (error.message?.includes("Not Found") || error.message?.includes("404")) {
            return NextResponse.json({ error: "Model gemini-2.5-flash-lite-001 not found. Check availability." }, { status: 404 });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
