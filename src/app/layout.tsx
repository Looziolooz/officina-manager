import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer"; // Importa il Footer

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="scroll-smooth">
      <body>
        <Navbar />
        {children}
        <Footer /> {/* Inserito alla fine */}
      </body>
    </html>
  );
}