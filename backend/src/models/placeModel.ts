import mongoose, { InferSchemaType, Schema } from "mongoose";
import { PLACE_KINDS } from "../types/common";
import { claimSchema, localizedTextSchema, statusField } from "./shared";

const placeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true }, // ex. "casemate-17", utilisé dans l'URL
    kind: { type: String, enum: [...PLACE_KINDS], required: true },
    name: { type: localizedTextSchema, required: true },
    description: { type: localizedTextSchema },
    currentState: { type: localizedTextSchema },
    // Position sur le plan du fort (en pixels de l'image, origine en haut à gauche)
    position: {
      x: { type: Number },
      y: { type: Number },
    },
    // Ordre de passage dans la visite guidée (1, 2, 3…)
    tourOrder: { type: Number, min: 0 },
    // Position réelle (vue satellite), en degrés
    geo: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },
    photos: [
      {
        url: { type: String, required: true },
        caption: { type: localizedTextSchema },
        // Photo d'archive ou actuelle : sert à la comparaison « hier et aujourd'hui »
        era: { type: String, enum: ["ancienne", "actuelle", "inconnue"], default: "inconnue" },
        dateLabel: { type: String }, // ex. « vers 1944 », « février 2026 »
        source: { type: Schema.Types.ObjectId, ref: "Source" },
      },
    ],
    sources: [{ type: Schema.Types.ObjectId, ref: "Source" }],
    claims: [claimSchema],
    missingInfo: [localizedTextSchema],
    status: statusField,
  },
  { timestamps: true }
);

export type IPlace = InferSchemaType<typeof placeSchema>;

const placeModel = mongoose.model("Place", placeSchema);

export default placeModel;
