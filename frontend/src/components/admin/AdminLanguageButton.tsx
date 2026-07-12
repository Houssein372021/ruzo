import { useI18n } from "../../hooks/useI18n";

type AdminLanguageButtonProps = {
  className?: string;
};

export function AdminLanguageButton({ className = "" }: AdminLanguageButtonProps) {
  const { language, toggleLanguage, t } = useI18n();

  return (
    <button
      type="button"
      aria-label={t("switchLanguage")}
      className={`px-2 py-1 uppercase tracking-display text-[#111111]/70 transition-colors hover:text-[#4B2E24] ${className}`}
      onClick={toggleLanguage}
    >
      {language === "en" ? "AR" : "EN"}
    </button>
  );
}
