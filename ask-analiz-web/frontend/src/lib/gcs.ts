import { Storage } from "@google-cloud/storage";

const storage = new Storage({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
    }
});

export const bucketName = "ask-analiz-uploads"; // We'll create this bucket if it doesn't exist
export const gcsClient = storage;
