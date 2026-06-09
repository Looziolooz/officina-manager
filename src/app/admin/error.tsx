"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Qualcosa è andato storto</h2>
        <p className="text-gray-400 text-sm">{error.message}</p>
        <button
          onClick={reset}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}
