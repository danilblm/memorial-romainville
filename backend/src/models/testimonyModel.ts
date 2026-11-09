import mongoose, { InferSchemaType, Schema } from "mongoose";
import { TESTIMONY_MEDIA } from "../types/common";
import { fuzzyDateSchema, localizedTextSchema, publicationSchema, statusField } from "./shared";

// Un témoignage ne s'affiche jamais sans son contexte :
// qui parle, pour qui, depuis quand, par quel chemin.
const testimonySchema = new Schema(
  {
    // Qui parle ?
    witness: { type: Schema.Types.ObjectId, ref: "Person" },
    witnessName: { type: String, required: true },
    witnessRelation: { type: String, required: true }, // internée, codétenue, enfant, historien…
    livedEvents: { type: Boolean, default: false }, // a-t-elle vécu ce qu'elle raconte ?

    // Pour qui ? (procès, enquête, interview filmée, lettre à la famille…)
    audience: { type: localizedTextSchema },

    // Depuis quand ?
    recordedAt: { type: fuzzyDateSchema },

    // Par quel chemin ?
    collectedBy: { type: String },
    transformations: { type: String }, // transcrit, traduit, coupé…
    originalLocation: { type: String },
    rights: { type: String },

    // Contenu
    medium: { type: String, enum: [...TESTIMONY_MEDIA], required: true },
    mediaUrl: { type: String },
    transcript: { type: localizedTextSchema },
    isExcerpt: { type: Boolean, default: false },
    fullVersionUrl: { type: String },
    notCovered: { type: localizedTextSchema }, // ce que le témoignage ne dit pas

    persons: [{ type: Schema.Types.ObjectId, ref: "Person" }],
    events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    places: [{ type: Schema.Types.ObjectId, ref: "Place" }],
    sources: [{ type: Schema.Types.ObjectId, ref: "Source" }],
    publication: { type: publicationSchema, default: () => ({}) },
    status: statusField,
  },
  { timestamps: true }
);

export type ITestimony = InferSchemaType<typeof testimonySchema>;

const testimonyModel = mongoose.model("Testimony", testimonySchema);

export default testimonyModel;
