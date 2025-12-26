// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OfficinaPro Manager",
  description: "Sistema gestionale avanzato per officine meccaniche",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      {/* Aggiungi suppressHydrationWarning qui sotto */}
      <body 
        className="bg-slate-950 text-slate-50 antialiased"
        suppressHydrationWarning={true} 
      >
        {children}
      </body>
    </html>
  );
}