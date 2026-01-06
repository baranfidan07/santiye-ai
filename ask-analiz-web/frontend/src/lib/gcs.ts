import { Storage } from "@google-cloud/storage";

let storage: Storage | null = null;

export const getStorage = () => {
    if (!storage) {
        storage = new Storage({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                project_id: process.env.GOOGLE_PROJECT_ID,
            }
        });
    }
    return storage;
};

export const bucketName = "ask-analiz-uploads";
