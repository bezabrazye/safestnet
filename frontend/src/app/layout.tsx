import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafestNet - AI-Powered Scam Detection",
  description: "Analyze URLs, news, and content for potential scams and misinformation with AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'SafestNet',
    description: 'AI analysis for URLs, content and news to detect scams',
    url: '/',
    siteName: 'SafestNet',
    images: [
      { url: '/og-default.png', width: 1200, height: 630, alt: 'SafestNet' },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafestNet',
    description: 'AI analysis for URLs, content and news to detect scams',
    images: ['/og-default.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}>
        {/* hCaptcha badge space if needed */}
        {/* Background video */}
        <video
          className="fixed inset-0 w-full h-full object-cover -z-10"
          src="/background_video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* UI KIT gradient overlay at ~20% */}
        <div className="bg-grad-overlay fixed inset-0 -z-10" />
        <ErrorBoundary>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
