"use client";

import React from "react";
import { getLang, setLang, LANG_FLAGS, LANG_LABELS, type Lang } from "@/lib/i18n";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "hi", label: "HI" },
  { value: "as", label: "AS" },
];

export function LanguageSwitcher() {
  const [lang, setLangState] = React.useState<Lang>("en");
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setLangState(getLang());
    const handler = (e: Event) => {
      const custom = e as CustomEvent<Lang>;
      if (custom.detail === "en" || custom.detail === "hi" || custom.detail === "as") {
        setLangState(custom.detail);
      } else {
        setLangState(getLang());
      }
    };
    window.addEventListener("ner-lang-change", handler);
    window.addEventListener("storage", handler);
    const onClickOutside = (ev: MouseEvent) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("ner-lang-change", handler);
      window.removeEventListener("storage", handler);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const select = (l: Lang) => {
    setLang(l);
    setLangState(l);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Select language"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs font-bold tracking-widest transition-colors"
      >
        <span aria-hidden>{LANG_FLAGS[lang]}</span>
        <span>{OPTIONS.find((o) => o.value === lang)?.label ?? lang.toUpperCase()}</span>
        <span className="opacity-60 text-[10px]">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => select(opt.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-100 transition-colors ${lang === opt.value ? "bg-slate-900 text-white hover:bg-slate-800" : "text-slate-800"}`}
            >
              <span aria-hidden>{LANG_FLAGS[opt.value]}</span>
              <span className="font-bold text-xs">{opt.label}</span>
              <span className="text-xs opacity-70">{LANG_LABELS[opt.value]}</span>
              {lang === opt.value && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
