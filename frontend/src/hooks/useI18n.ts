import { useMemo } from "react";
import { translations, type TranslationKey } from "../i18n/translations";
import { useLanguageStore } from "../store/languageStore";

export function useI18n() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);

  return useMemo(
    () => ({
      language,
      dir: language === "ar" ? "rtl" : "ltr",
      setLanguage,
      toggleLanguage,
      t: (key: TranslationKey, params?: Record<string, string>) => {
        let value = translations[language][key] ?? translations.en[key] ?? key;
        Object.entries(params ?? {}).forEach(([paramKey, paramValue]) => {
          value = value.replace(`{${paramKey}}`, paramValue);
        });
        return value;
      },
    }),
    [language, setLanguage, toggleLanguage],
  );
}
