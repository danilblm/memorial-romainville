import mongoose, { InferSchemaType, Schema } from "mongoose";

// Réglages du site modifiables par l'équipe (un seul document, key = "site")
const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "site" },
    // Plan du fort affiché sur la carte. Sans plan, le site utilise le plan provisoire.
    plan: {
      url: { type: String },
      width: { type: Number, min: 1 },
      height: { type: Number, min: 1 },
    },
  },
  { timestamps: true }
);

export type ISettings = InferSchemaType<typeof settingsSchema>;

const settingsModel = mongoose.model("Settings", settingsSchema);

export default settingsModel;
