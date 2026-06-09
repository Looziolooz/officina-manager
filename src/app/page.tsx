import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services"; // Aggiungi questo
import ContactLocation from "@/components/sections/ContactLocation";

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden pt-20"> 
      <Hero />
      <About />
      <Services /> 
      <ContactLocation />
    </main>
  );
}