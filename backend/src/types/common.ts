// Vocabulaires partagés par tous les modèles.
// Les libellés affichés au public sont dans frontend/src/i18n.

// Niveau de fiabilité d'une affirmation (proposition, à valider avec le groupe)
export const RELIABILITY_LEVELS = [
  "documentee", // attestée par une source d'archive identifiée
  "recoupee", // confirmée par au moins deux sources indépendantes
  "temoignee", // rapportée par un témoin direct, sans document
  "transmise", // rapportée par un proche ou un tiers
  "incertaine", // sources en désaccord ou information partielle
  "inconnue", // on sait que l'information existe mais on ne l'a pas
] as const;
export type Reliability = (typeof RELIABILITY_LEVELS)[number];

// Statut de validation d'un contenu (seul "valide" est publié)
export const VALIDATION_STATUSES = ["propose", "en_verification", "valide", "refuse"] as const;
export type ValidationStatus = (typeof VALIDATION_STATUSES)[number];

// Précision d'une date (une date historique est souvent approximative)
export const DATE_PRECISIONS = ["jour", "mois", "annee", "vers", "inconnue"] as const;
export type DatePrecision = (typeof DATE_PRECISIONS)[number];

// Consentement de la personne ou de sa famille
export const CONSENT_STATES = ["accorde", "refuse", "inconnu"] as const;

// Visibilité publique d'une fiche
// - publique : fiche complète
// - reservee : présence mentionnée, détails retirés (refus d'exposition)
// - masquee  : rien n'est affiché
export const VISIBILITY_LEVELS = ["publique", "reservee", "masquee"] as const;
export type Visibility = (typeof VISIBILITY_LEVELS)[number];

export const USER_ROLES = ["admin", "moderateur"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SOURCE_TYPES = [
  "registre",
  "lettre",
  "photographie",
  "graffiti",
  "archive",
  "article",
  "temoignage",
  "autre",
] as const;

export const PLACE_KINDS = ["casemate", "cour", "batiment", "autre"] as const;

export const TESTIMONY_MEDIA = ["ecrit", "audio", "video"] as const;

export const CONTRIBUTION_TARGETS = ["person", "place", "event", "source", "autre"] as const;
