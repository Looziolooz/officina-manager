import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/SEO/JsonLd";
import { SessionProvider } from "next-auth/react";

// Inter Variable (Linear style)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// Configurazione Viewport (Separata)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1011",
};

// Metadata SEO
export const metadata: Metadata = {
  title: "GT Service | Officina Meccanotronica Giovanni Tambuscio Jonadi (VV)",
  description: "GT Service è l'officina meccanotronica d'eccellenza a Jonadi. Specializzati in diagnosi computerizzata, meccanica di precisione e assistenza qualificata.",
  keywords: [
    "meccanico Jonadi",
    "officina Vibo Valentia",
    "meccanotronica Calabria",
    "diagnosi auto Vibo",
    "Giovanni Tambuscio",
    "ricarica clima Jonadi",
    "manutenzione auto VV",
  ],
  authors: [{ name: "Giovanni Tambuscio" }],
  robots: "index, follow",
  openGraph: {
    title: "GT Service - Officina Meccanotronica a Jonadi",
    description: "L'evoluzione della meccanica incontra l'elettronica. Prenota il tuo check-up ora.",
    url: "https://gtservice.it",
    siteName: "GT Service",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GT Service Officina Meccanotronica",
      },
    ],
    locale: "it_IT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="scroll-smooth">
      <body
        className={`${inter.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <JsonLd />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="grow pt-20">{children}</main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}