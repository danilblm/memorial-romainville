import mongoose, { InferSchemaType, Schema } from "mongoose";
import {
  claimSchema,
  fuzzyDateSchema,
  localizedTextSchema,
  publicationSchema,
  statusField,
} from "./shared";

const personSchema = new Schema(
  {
    displayName: { type: String, required: true },
    nameVariants: [{ type: String }], // orthographes trouvées dans les sources
    photo: { type: String },
    roles: [{ type: String }], // résistante, otage, déportée…
    biography: { type: localizedTextSchema },
    birth: { type: fuzzyDateSchema },
    death: { type: fuzzyDateSchema },
    arrivalAtFort: { type: fuzzyDateSchema }, // sert à placer la femme dans l'arbre
    departureFromFort: { type: fuzzyDateSchema },
    places: [{ type: Schema.Types.ObjectId, ref: "Place" }],
    events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    sources: [{ type: Schema.Types.ObjectId, ref: "Source" }],
    claims: [claimSchema],
    missingInfo: [localizedTextSchema], // "Ce que l'on ne sait pas"
    publication: { type: publicationSchema, default: () => ({}) },
    status: statusField,
  },
  { timestamps: true }
);

export type IPerson = InferSchemaType<typeof personSchema>;

const personModel = mongoose.model("Person", personSchema);

export default personModel;
