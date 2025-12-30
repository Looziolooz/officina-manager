import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Importazione Componenti Layout
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/SEO/JsonLd";

// Configurazione Font Moderni
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata SEO per posizionamento locale (Jonadi / Vibo Valentia)
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
    "manutenzione auto VV"
  ],
  authors: [{ name: "Giovanni Tambuscio" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "GT Service - Officina Meccanotronica a Jonadi",
    description: "L'evoluzione della meccanica incontra l'elettronica. Prenota il tuo check-up ora.",
    url: "https://gtservice.it", // Sostituire con dominio reale al deployment
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-slate-100`}
        cz-shortcut-listen="true"
      >
        {/* Schema.org JSON-LD per Google Local SEO */}
        <JsonLd />
        
        {/* Struttura Layout */}
        <div className="flex flex-col min-h-screen">
          <Navbar />
          
          <main className="grow pt-20">
            {children}
          </main>
          
          <Footer />
        </div>
      </body>
    </html>
  );
}