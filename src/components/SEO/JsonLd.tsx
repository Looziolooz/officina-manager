// src/components/SEO/JsonLd.tsx
import { SITE_DATA } from "@/constants";

export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": "GT Service - Officina Meccanotronica",
    "image": "https://vostro-dominio.it/logo.png",
    "@id": "https://vostro-dominio.it",
    "url": "https://vostro-dominio.it",
    "telephone": SITE_DATA.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Via Giuseppe Verdi",
      "addressLocality": "Jonadi",
      "addressRegion": "VV",
      "postalCode": "89851",
      "addressCountry": "IT"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 38.6414, // Sostituisci con coord esatte se possibile
      "longitude": 16.0522
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:30",
        "closes": "18:30"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "08:30",
        "closes": "12:30"
      }
    ],
    "sameAs": [
      SITE_DATA.social
    ]
  };

  return (
    
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}