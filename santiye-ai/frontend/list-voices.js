const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env from frontend/.env.local
const envPath = path.resolve(__dirname, '../src/app/api/voice/.env.local'); // adjusting path
// Actually easier to just read the file from where it is known to be: frontend/.env.local
// But this script is in `frontend/scripts`? 
// Let's assume we run it from `frontend` root.

dotenv.config({ path: '.env.local' });

const client = new TextToSpeechClient({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
    }
});

async function listVoices() {
    try {
        const [result] = await client.listVoices({ languageCode: 'tr-TR' });
        const voices = result.voices;

        console.log('Voices available for tr-TR:');
        voices.forEach(voice => {
            console.log(`Name: ${voice.name}, Gender: ${voice.ssmlGender}, NaturalSampleRateHertz: ${voice.naturalSampleRateHertz}`);
        });
    } catch (err) {
        console.error('ERROR:', err);
    }
}

listVoices();
