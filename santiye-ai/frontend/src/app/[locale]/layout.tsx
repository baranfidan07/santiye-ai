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
  title: "Şantiye AI - Kriz Çözücü",
  description: "Şantiyedeki sorunları saniyeler içinde çöz. İş güvenliği, lojistik ve kriz yönetimi için yapay zeka asistanı.",
  openGraph: {
    title: "Şantiye AI - Akıllı Şantiye Asistanı",
    description: "Şantiyedeki sorunları saniyeler içinde çöz. İş güvenliği, lojistik ve kriz yönetimi için yapay zeka asistanı.",
    url: "https://santiye-ai.com",
    siteName: "Şantiye AI",
    images: [
      {
        url: "/og-image.png", // We will need to update this asset later
        width: 1200,
        height: 630,
        alt: "Şantiye AI Dashboard",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Şantiye AI - Kriz Çözücü",
    description: "Şantiyedeki sorunları saniyeler içinde çöz.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ff6d00", // Safety Orange
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
