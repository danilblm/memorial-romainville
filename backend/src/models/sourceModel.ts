import mongoose, { InferSchemaType, Schema } from "mongoose";
import { SOURCE_TYPES } from "../types/common";
import { fuzzyDateSchema, localizedTextSchema, statusField } from "./shared";

const sourceSchema = new Schema(
  {
    type: { type: String, enum: [...SOURCE_TYPES], required: true },
    title: { type: localizedTextSchema, required: true },
    holder: { type: String }, // lieu de conservation (Archives 93, fonds de l'historien…)
    reference: { type: String }, // cote
    url: { type: String },
    fileUrl: { type: String },
    date: { type: fuzzyDateSchema },
    author: { type: String },
    rights: { type: String }, // conditions d'utilisation sur le site
    status: statusField,
  },
  { timestamps: true }
);

export type ISource = InferSchemaType<typeof sourceSchema>;

const sourceModel = mongoose.model("Source", sourceSchema);

export default sourceModel;
