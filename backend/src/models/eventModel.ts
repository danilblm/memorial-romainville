import mongoose, { InferSchemaType, Schema } from "mongoose";
import { claimSchema, fuzzyDateSchema, localizedTextSchema, statusField } from "./shared";

const eventSchema = new Schema(
  {
    title: { type: localizedTextSchema, required: true },
    description: { type: localizedTextSchema },
    start: { type: fuzzyDateSchema, required: true },
    end: { type: fuzzyDateSchema },
    period: { type: String }, // sert au filtre de la frise, ex. "1940-1944"
    persons: [{ type: Schema.Types.ObjectId, ref: "Person" }],
    places: [{ type: Schema.Types.ObjectId, ref: "Place" }],
    sources: [{ type: Schema.Types.ObjectId, ref: "Source" }],
    claims: [claimSchema],
    status: statusField,
  },
  { timestamps: true }
);

export type IEvent = InferSchemaType<typeof eventSchema>;

const eventModel = mongoose.model("Event", eventSchema);

export default eventModel;
