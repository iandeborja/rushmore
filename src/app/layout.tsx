import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "rushmore",
  description: "what's on your mt. rushmore?",
  openGraph: {
    title: "rushmore",
    description: "what's on your mt. rushmore?",
    images: [
      {
        url: '/rushmore_OG.png',
        width: 1200,
        height: 630,
        alt: 'Rushmore - What\'s your Mt. Rushmore?',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "rushmore",
    description: "what's on your mt. rushmore?",
    images: ['/rushmore_OG.png'],
  },
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          defer
          data-domain="rushmore.vercel.app"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <Providers>
            {children}
          </Providers>
        </ToastProvider>
      </body>
    </html>
  );
}
