"use client";

export type Lang = "en" | "hi" | "as";

export const STORAGE_KEY = "ner-lang";

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  hi: "हिन्दी",
  as: "অসমীয়া",
};

export const LANG_FLAGS: Record<Lang, string> = {
  en: "🇬🇧",
  hi: "🇮🇳",
  as: "🇮🇳",
};

export const translations: Record<Lang, Record<string, string>> = {
  en: {
    "NER LOGISTICS INTELLIGENCE COMMAND CENTER":
      "NER LOGISTICS INTELLIGENCE COMMAND CENTER",
    "NORTH EASTERN REGION • REAL-TIME MONITORING":
      "NORTH EASTERN REGION • REAL-TIME MONITORING",
    "LIVE GPS": "LIVE GPS",
    "EMERGENCY MODE": "EMERGENCY MODE",
    "EXIT EMERGENCY": "EXIT EMERGENCY",
    "EMERGENCY ACTIVE": "EMERGENCY ACTIVE",
    "LIVE": "LIVE",
    "OVERALL ACCESSIBILITY": "OVERALL ACCESSIBILITY",
    "ACTIVE DISRUPTIONS": "ACTIVE DISRUPTIONS",
    "VEHICLES IN TRANSIT": "VEHICLES IN TRANSIT",
    "DELAYED DELIVERIES": "DELAYED DELIVERIES",
    "GIS ACCESSIBILITY MAP • NER": "GIS ACCESSIBILITY MAP • NER",
    "DISTRICTS AT RISK": "DISTRICTS AT RISK",
    "FIELD INTELLIGENCE • OFFLINE QUEUE": "FIELD INTELLIGENCE • OFFLINE QUEUE",
    "ESSENTIAL SUPPLIES": "ESSENTIAL SUPPLIES",
    "Last sync:": "Last sync:",
    "LIVE FEED": "LIVE FEED",
  },
  hi: {
    "NER LOGISTICS INTELLIGENCE COMMAND CENTER":
      "एनईआर लॉजिस्टिक्स इंटेलिजेंस कमांड सेंटर",
    "NORTH EASTERN REGION • REAL-TIME MONITORING":
      "उत्तर पूर्वी क्षेत्र • रीयल-टाइम निगरानी",
    "LIVE GPS": "लाइव जीपीएस",
    "EMERGENCY MODE": "आपातकालीन मोड",
    "EXIT EMERGENCY": "आपातकाल से बाहर निकलें",
    "EMERGENCY ACTIVE": "आपातकाल सक्रिय",
    "LIVE": "लाइव",
    "OVERALL ACCESSIBILITY": "समग्र पहुँच",
    "ACTIVE DISRUPTIONS": "सक्रिय व्यवधान",
    "VEHICLES IN TRANSIT": "पारगमन में वाहन",
    "DELAYED DELIVERIES": "विलंबित डिलीवरी",
    "GIS ACCESSIBILITY MAP • NER": "जीआईएस पहुँच मानचित्र • एनईआर",
    "DISTRICTS AT RISK": "जोखिम वाले जिले",
    "FIELD INTELLIGENCE • OFFLINE QUEUE": "फील्ड इंटेलिजेंस • ऑफ़लाइन कतार",
    "ESSENTIAL SUPPLIES": "आवश्यक आपूर्ति",
    "Last sync:": "अंतिम सिंक:",
    "LIVE FEED": "लाइव फीड",
    "Districts Monitored": "मॉनिटर किए गए जिले",
    "Roads Open": "सड़कें खुली",
    "Roads Disrupted": "बाधित सड़कें",
    "Active Incidents": "सक्रिय घटनाएं",
    "High-Risk Corridors": "उच्च-जोखिम कॉरिडोर",
  },
  as: {
    "NER LOGISTICS INTELLIGENCE COMMAND CENTER":
      "এনইআৰ লজিষ্টিকছ ইনটেলিজেন্স কমাণ্ড চেণ্টাৰ",
    "NORTH EASTERN REGION • REAL-TIME MONITORING":
      "উত্তৰ-পূব অঞ্চল • ৰিয়েল-টাইম নিৰীক্ষণ",
    "LIVE GPS": "লাইভ জিপিএছ",
    "EMERGENCY MODE": "জৰুৰীকালীন মোড",
    "EXIT EMERGENCY": "জৰুৰীকালৰ পৰা ওলাওক",
    "EMERGENCY ACTIVE": "জৰুৰীকাল সক্ৰিয়",
    "LIVE": "লাইভ",
    "OVERALL ACCESSIBILITY": "সামগ্ৰিক প্ৰৱেশযোগ্যতা",
    "ACTIVE DISRUPTIONS": "সক্ৰিয় ব্যাঘাত",
    "VEHICLES IN TRANSIT": "পৰিবহণত থকা বাহন",
    "DELAYED DELIVERIES": "পলম হোৱা ডেলিভাৰী",
    "GIS ACCESSIBILITY MAP • NER": "জিআইএছ প্ৰৱেশ মানচিত্ৰ • এনইআৰ",
    "DISTRICTS AT RISK": "বিপদত থকা জিলাসমূহ",
    "FIELD INTELLIGENCE • OFFLINE QUEUE": "ফিল্ড ইনটেলিজেন্স • অফলাইন শাৰী",
    "ESSENTIAL SUPPLIES": "অত্যাৱশ্যকীয় যোগান",
    "Last sync:": "শেষ ছিংক:",
    "LIVE FEED": "লাইভ ফিড",
    "Districts Monitored": "নিৰীক্ষণত থকা জিলা",
    "Roads Open": "খোলা ৰাস্তা",
    "Roads Disrupted": "ব্যাহত ৰাস্তা",
    "Active Incidents": "সক্ৰিয় ঘটনা",
    "High-Risk Corridors": "উচ্চ বিপদ কৰিডৰ",
  },
};

export function getLang(): Lang {
  if (typeof window === "undefined") return "en";
  const v = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (v === "en" || v === "hi" || v === "as") return v;
  return "en";
}

export function setLang(lang: Lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new CustomEvent("ner-lang-change", { detail: lang }));
  // also trigger storage event for cross-tab
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: lang } as any));
}

export function t(key: string, langOverride?: Lang): string {
  const lang = langOverride ?? getLang();
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

// React hook for reactive translations
import { useEffect, useState, useCallback } from "react";

export function useTranslation() {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(getLang());
    const handler = (e: Event) => {
      const custom = e as CustomEvent<Lang>;
      if (custom.detail && (custom.detail === "en" || custom.detail === "hi" || custom.detail === "as")) {
        setLangState(custom.detail);
      } else {
        setLangState(getLang());
      }
    };
    window.addEventListener("ner-lang-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("ner-lang-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const translate = useCallback(
    (key: string) => translations[lang]?.[key] ?? translations.en[key] ?? key,
    [lang]
  );

  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    setLangState(l);
  }, []);

  return { lang, t: translate, setLang: changeLang };
}
