import { Schema } from "mongoose";
import {
  CONSENT_STATES,
  DATE_PRECISIONS,
  RELIABILITY_LEVELS,
  VALIDATION_STATUSES,
  VISIBILITY_LEVELS,
} from "../types/common";

// Texte bilingue
export const localizedTextSchema = new Schema(
  {
    fr: { type: String, default: "" },
    en: { type: String, default: "" },
  },
  { _id: false }
);

// Date avec sa précision ("août 1942", "vers 1943"…)
export const fuzzyDateSchema = new Schema(
  {
    date: { type: Date },
    precision: { type: String, enum: [...DATE_PRECISIONS], default: "inconnue" },
    label: { type: localizedTextSchema },
  },
  { _id: false }
);

// Une affirmation : on ne stocke pas des "faits", mais des affirmations
// qui portent chacune leur source, leur fiabilité et leur statut.
export const claimSchema = new Schema({
  field: { type: String, required: true }, // ex. "arrivee", "deportation", "role"
  value: { type: localizedTextSchema, required: true },
  sources: [{ type: Schema.Types.ObjectId, ref: "Source" }],
  reliability: { type: String, enum: [...RELIABILITY_LEVELS], default: "inconnue" },
  status: { type: String, enum: [...VALIDATION_STATUSES], default: "propose" },
  note: { type: String },
  aiAssisted: { type: Boolean, default: false }, // l'IA a aidé à la produire : affiché au public
});

// Consentement et visibilité publique
export const publicationSchema = new Schema(
  {
    consent: { type: String, enum: [...CONSENT_STATES], default: "inconnu" },
    visibility: { type: String, enum: [...VISIBILITY_LEVELS], default: "publique" },
    note: { type: localizedTextSchema }, // explication affichée au public
  },
  { _id: false }
);

export const statusField = {
  type: String,
  enum: [...VALIDATION_STATUSES],
  default: "propose",
};
