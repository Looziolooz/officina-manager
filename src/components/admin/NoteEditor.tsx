"use client";
import { useState } from "react";
import { Save, Check } from "lucide-react";
import { updateCustomerNotes } from "@/app/actions/customer";

interface NoteEditorProps {
  customerId: string;
  type: "technical" | "family";
  initialContent?: string | null;
  icon: React.ReactNode;
  title: string;
  colorClass: "blue" | "orange";
}

export default function NoteEditor({ customerId, type, initialContent, icon, title, colorClass }: NoteEditorProps) {
  const [content, setContent] = useState(initialContent || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateCustomerNotes(customerId, type, content);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Classi dinamiche per Tailwind
  const containerClasses = colorClass === "blue" 
    ? "bg-blue-500/5 border-blue-500/20" 
    : "bg-orange-500/5 border-orange-500/20";
    
  const titleClasses = colorClass === "blue" 
    ? "text-blue-400" 
    : "text-orange-400";

  return (
    <div className={`p-6 rounded-2xl border ${containerClasses}`}>
      <div className={`flex items-center gap-2 mb-4 font-bold uppercase tracking-wider text-xs ${titleClasses}`}>
        {icon} {title}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full bg-slate-950/50 border border-white/5 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all min-h-40"
        placeholder="Scrivi qui..."
      />
      <div className="flex justify-end mt-4">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Salvato" : "Salva"}
        </button>
      </div>
    </div>
  );
}