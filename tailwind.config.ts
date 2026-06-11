// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Token semantici mappati alle variabili CSS in globals.css (:root),
        // così classi come bg-surface / text-foreground / border-border funzionano.
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        surface: "rgb(var(--surface))",
        muted: "rgb(var(--muted))",
        "muted-foreground": "rgb(var(--muted-foreground))",
        border: "rgb(var(--border))",
        input: "rgb(var(--input))",
        ring: "rgb(var(--ring))",
        secondary: "rgb(var(--secondary))",
        "secondary-foreground": "rgb(var(--secondary-foreground))",
        "accent-foreground": "rgb(var(--accent-foreground))",
        "primary-foreground": "rgb(var(--primary-foreground))",
        // Colori brand fissi (non dipendono dalle variabili CSS).
        primary: "#E30613",    // Rosso brand GT Service
        "primary-hover": "#B8050F", // Tono più scuro per hover
        accent: "rgb(var(--accent))",   // nero brand
        success: "rgb(var(--success))",
        warning: "rgb(var(--warning))",
        danger: "rgb(var(--danger))",
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
      }
    },
  },
  plugins: [],
};
export default config;