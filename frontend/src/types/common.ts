// Mêmes vocabulaires que backend/src/types/common.ts

export type Reliability =
  | "documentee"
  | "recoupee"
  | "temoignee"
  | "transmise"
  | "incertaine"
  | "inconnue";

export const RELIABILITY_LEVELS: Reliability[] = [
  "documentee",
  "recoupee",
  "temoignee",
  "transmise",
  "incertaine",
  "inconnue",
];

export type ValidationStatus = "propose" | "en_verification" | "valide" | "refuse";

export type DatePrecision = "jour" | "mois" | "annee" | "vers" | "inconnue";

export type Visibility = "publique" | "reservee" | "masquee";

export interface LocalizedText {
  fr?: string;
  en?: string;
}

export interface FuzzyDate {
  date?: string | null;
  precision?: DatePrecision;
  label?: LocalizedText;
}

export interface Claim {
  _id: string;
  field: string;
  value: LocalizedText;
  sources?: string[];
  reliability: Reliability;
  status: ValidationStatus;
  note?: string;
  aiAssisted?: boolean;
}

export interface Publication {
  consent?: "accorde" | "refuse" | "inconnu";
  visibility?: Visibility;
  note?: LocalizedText;
}
