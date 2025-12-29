import { NextRequest, NextResponse } from "next/server";
import { gcsClient, bucketName } from "@/lib/gcs";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as Blob;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${uuidv4()}-${(file as File).name || 'image.png'}`;
        const bucket = gcsClient.bucket(bucketName);
        const gcsFile = bucket.file(filename);

        await gcsFile.save(buffer, {
            contentType: file.type,
            resumable: false // suitable for smaller files like screenshots
        });

        // Generate a public URL (or signed URL if strictly private) and the GS URI
        // For simplicity in UI, we might want a signed URL to display it
        // Or if we made the bucket public (we didn't explicitly), signed URL is safer.
        const [signedUrl] = await gcsFile.getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60, // 1 hour
        });

        const gsUri = `gs://${bucketName}/${filename}`;

        console.log("Upload Success. GS URI:", gsUri);

        return NextResponse.json({
            url: signedUrl,
            gsUri: gsUri,
            filename: filename
        });

    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
