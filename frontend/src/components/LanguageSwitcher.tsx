import { useTranslation } from "react-i18next";
import { LANGUAGE_KEY } from "../i18n";
import { cn } from "../utils/cn";

const LANGUAGES = ["fr", "en"] as const;

const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { t, i18n } = useTranslation();
  const current = i18n.language.startsWith("en") ? "en" : "fr";

  const change = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      // stockage indisponible
    }
  };

  return (
    <div role="group" aria-label={t("lang.label")} className={cn("inline-flex rounded-full border border-line bg-card p-0.5", className)}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          aria-pressed={current === lang}
          onClick={() => change(lang)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition",
            current === lang ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
          )}
        >
          {t(`lang.${lang}`)}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
