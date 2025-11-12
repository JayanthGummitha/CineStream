import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as RadixToaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineStream - Stream thousands of movies and TV shows instantly",
  description: "CineStream is a modern OTT platform that delivers high-quality video content such as movies, web series, documentaries, and more. Stream cinema-quality entertainment across all devices.",
  keywords: "streaming, movies, TV shows, entertainment, OTT platform, video streaming",
  authors: [{ name: "CineStream" }],
  creator: "CineStream",
  publisher: "CineStream",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://cinestream.com"),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: "CineStream - Stream thousands of movies and TV shows instantly",
    description: "Stream cinema-quality entertainment across all devices with CineStream's modern OTT platform.",
    url: "https://cinestream.com",
    siteName: "CineStream",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CineStream - Premium Streaming Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineStream - Stream thousands of movies and TV shows instantly",
    description: "Stream cinema-quality entertainment across all devices with CineStream's modern OTT platform.",
    images: ["/og-image.jpg"],
    creator: "@cinestream",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans min-wsc`}
      >
        <Providers>
          {children}
          <Toaster />
          <RadixToaster />
        </Providers>
      </body>
    </html>
  );
}
