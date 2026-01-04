import { NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:8000";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Proxy to Python Backend
        const res = await fetch(`${BACKEND_URL}/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Backend Error:", errorText);
            return NextResponse.json({ insight: "Sunucu hatası şefim.", risk_score: 0 }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Proxy Error:", error);
        return NextResponse.json(
            { insight: `Bağlantı hatası: ${error.message}`, risk_score: 0 },
            { status: 500 }
        );
    }
}
