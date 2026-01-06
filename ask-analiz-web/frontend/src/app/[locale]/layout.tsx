import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import MainLayout from "@/components/Layout/MainLayout";
import { routing } from "@/i18n/routing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AskAnaliz - İlişkin Toksik Mi?",
  description: "Yapay zeka ile mesajlarını analiz et, gerçekleri öğren. İlişkinin risk skorunu hesapla.",
  openGraph: {
    title: "AskAnaliz - İlişkin Toksik Mi?",
    description: "Mesajlarını yükle, yapay zeka analiz etsin. İlişkinin gizli gerçeklerini öğren.",
    url: "https://askanaliz.com",
    siteName: "AskAnaliz",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AskAnaliz AI Relationship Analysis",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AskAnaliz - İlişkin Toksik Mi?",
    description: "Yapay zeka ile mesajlarını analiz et.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zoom on input focus
  themeColor: "#000000",
  viewportFit: "cover"
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}



import { CreditsProvider } from "@/contexts/CreditsContext";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <CreditsProvider>
            <MainLayout>{children}</MainLayout>
            <Analytics />
            <SpeedInsights />
          </CreditsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
