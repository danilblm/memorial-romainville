import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LANGUAGE_KEY } from "../i18n";

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const current = i18n.language.startsWith("en") ? "en" : "fr";

  const change = (_: unknown, lang: string | null) => {
    if (!lang) return;
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      // stockage indisponible
    }
  };

  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={current}
      onChange={change}
      aria-label={t("lang.label")}
      sx={{ bgcolor: "background.paper" }}
    >
      <ToggleButton value="fr" lang="fr">
        {t("lang.fr")}
      </ToggleButton>
      <ToggleButton value="en" lang="en">
        {t("lang.en")}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default LanguageSwitcher;
