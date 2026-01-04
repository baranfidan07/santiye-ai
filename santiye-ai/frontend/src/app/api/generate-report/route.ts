import { NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:8000";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const res = await fetch(`${BACKEND_URL}/generate-report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            return NextResponse.json({ report_text: "Rapor sunucusu hatası." }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json(
            { report_text: `Rapor hatası: ${error.message}` },
            { status: 500 }
        );
    }
}
