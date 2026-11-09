import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import fr from "./fr.json";

export const LANGUAGE_KEY = "lang";

const savedLanguage = (() => {
  try {
    return localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
})();

i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en } },
  lng: savedLanguage ?? "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

document.documentElement.lang = i18n.language;

export default i18n;
