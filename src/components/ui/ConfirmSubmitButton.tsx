"use client";

import type { ReactNode } from "react";

interface ConfirmSubmitButtonProps {
  /** Messaggio della finestra di conferma prima dell'invio del form. */
  message?: string;
  className?: string;
  children: ReactNode;
}

// Bottone di submit con conferma (confirm()). Vive in un Client Component perché
// onClick è un event handler: i Server Component non possono definirlo.
// Va usato dentro un <form action={serverAction}>: se l'utente annulla, il submit
// viene bloccato; altrimenti il form invia normalmente alla server action.
export default function ConfirmSubmitButton({
  message = "Sei sicuro?",
  className,
  children,
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
