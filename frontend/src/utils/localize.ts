import { FuzzyDate, LocalizedText } from "../types/common";

const isEnglish = (lang: string) => lang.startsWith("en");

// Texte dans la langue choisie, avec repli sur l'autre langue
export const localize = (text: LocalizedText | undefined | null, lang: string): string => {
  if (!text) return "";
  const preferred = isEnglish(lang) ? text.en : text.fr;
  return preferred || text.fr || text.en || "";
};

// Affiche une date selon sa précision : "août 1942", "vers 1943", "Date inconnue"
export const formatFuzzyDate = (value: FuzzyDate | undefined, lang: string): string => {
  const en = isEnglish(lang);
  if (value?.label && localize(value.label, lang)) return localize(value.label, lang);
  if (!value?.date || value.precision === "inconnue") return en ? "Unknown date" : "Date inconnue";

  const date = new Date(value.date);
  const locale = en ? "en-GB" : "fr-FR";
  const year = date.getUTCFullYear();

  switch (value.precision) {
    case "jour":
      return date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    case "mois":
      return date.toLocaleDateString(locale, { month: "long", year: "numeric", timeZone: "UTC" });
    case "vers":
      return en ? `c. ${year}` : `vers ${year}`;
    default:
      return String(year);
  }
};
