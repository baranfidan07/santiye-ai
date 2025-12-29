import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.askanaliz.app',
  appName: 'AskAnaliz',
  webDir: 'out',
  server: {
    // Point to the live Vercel URL so API routes (server actions) work
    url: 'https://ask-analiz-web-frontend.vercel.app',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    }
  }
};

export default config;
