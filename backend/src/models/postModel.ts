import mongoose, { InferSchemaType, Schema } from "mongoose";
import { COMMUNITY_STATUSES, POST_KINDS } from "../types/common";

const reportSchema = new Schema(
  {
    by: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    reason: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Publication du réseau thématique. Elle n'est PAS une source vérifiée :
// pour entrer au mémorial, un document passe par l'espace « Contribuer ».
const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    kind: { type: String, enum: [...POST_KINDS], default: "discussion" },
    title: { type: String, trim: true },
    text: { type: String, required: true },
    image: {
      url: { type: String },
      alt: { type: String },
    },
    tags: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    commentCount: { type: Number, default: 0 },
    status: { type: String, enum: [...COMMUNITY_STATUSES], default: "publie" },
    reports: [reportSchema],
    moderation: {
      by: { type: Schema.Types.ObjectId, ref: "User" },
      at: { type: Date },
      reason: { type: String },
    },
  },
  { timestamps: true }
);

postSchema.index({ status: 1, createdAt: -1 });

export type IPost = InferSchemaType<typeof postSchema>;

const postModel = mongoose.model("Post", postSchema);

export default postModel;
