import mongoose, { InferSchemaType, Schema } from "mongoose";
import { CONTRIBUTION_TARGETS } from "../types/common";
import { statusField } from "./shared";

// Proposition envoyée par le public. Jamais publiée automatiquement :
// l'équipe vérifie authenticité, provenance et intérêt historique.
const contributionSchema = new Schema(
  {
    contributor: {
      name: { type: String, required: true },
      email: { type: String, required: true }, // jamais exposé publiquement
      relation: { type: String }, // lien avec la personne ou le document
    },
    target: {
      kind: { type: String, enum: [...CONTRIBUTION_TARGETS], required: true },
      id: { type: Schema.Types.ObjectId },
      label: { type: String },
    },
    content: { type: String, required: true },
    declaredProvenance: { type: String, required: true },
    files: [
      {
        storedName: { type: String, required: true },
        originalName: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number },
      },
    ],
    consentToPublish: { type: Boolean, required: true },
    status: statusField,
    decision: {
      by: { type: Schema.Types.ObjectId, ref: "User" },
      at: { type: Date },
      reason: { type: String },
    },
  },
  { timestamps: true }
);

export type IContribution = InferSchemaType<typeof contributionSchema>;

const contributionModel = mongoose.model("Contribution", contributionSchema);

export default contributionModel;
