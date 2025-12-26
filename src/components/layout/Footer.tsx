export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-slate-400">
          © {new Date().getFullYear()} OfficinaPro. Tutti i diritti riservati.
        </p>
        <p className="text-slate-600 text-sm mt-2">
          Via dei Meccanici 12, Milano - P.IVA 1234567890
        </p>
      </div>
    </footer>
  );
}