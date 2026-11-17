import mongoose, { HydratedDocument, InferSchemaType, Schema } from "mongoose";
import { MEMBER_PROFILES } from "../types/common";

// Membres de « la communauté du fort » (le public inscrit).
// Distincts des comptes de l'équipe (userModel) : un membre ne peut jamais administrer le site.
const memberSchema = new Schema(
  {
    displayName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true }, // jamais exposé
    password: { type: String, required: true },
    profile: { type: String, enum: [...MEMBER_PROFILES], default: "passionne" },
    bio: { type: String, default: "" },
    interests: [{ type: String }],
    suspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type IMember = InferSchemaType<typeof memberSchema>;
export type MemberDocument = HydratedDocument<IMember>;

const memberModel = mongoose.model("Member", memberSchema);

export default memberModel;
