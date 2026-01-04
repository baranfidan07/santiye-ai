const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: '.env.local' });

const storage = new Storage({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
    }
});

const bucketName = 'ask-analiz-uploads';

async function setupBucket() {
    try {
        const [bucket] = await storage.createBucket(bucketName, {
            location: 'EU', // Store in EU for lower latency/privacy
            storageClass: 'STANDARD',
        });
        console.log(`Bucket ${bucketName} created.`);
    } catch (err) {
        if (err.code === 409) {
            console.log(`Bucket ${bucketName} already exists.`);
        } else {
            console.error('Error creating bucket:', err);
        }
    }

    try {
        await storage.bucket(bucketName).setCorsConfiguration([
            {
                maxAgeSeconds: 3600,
                method: ['GET', 'POST', 'PUT'],
                origin: ['*'],
                responseHeader: ['Content-Type'],
            },
        ]);
        console.log('CORS configuration set.');
    } catch (err) {
        console.error('Error setting CORS:', err);
    }
}

setupBucket();
