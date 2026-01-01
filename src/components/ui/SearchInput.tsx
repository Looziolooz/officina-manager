"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchInput({ placeholder, defaultValue }: { placeholder: string; defaultValue: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const [searchTerm, setSearchTerm] = useState(defaultValue);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    // Debounce manuale
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        params.set("q", searchTerm);
      } else {
        params.delete("q");
      }
      replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, pathname, replace, searchParams]);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-black/20 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}