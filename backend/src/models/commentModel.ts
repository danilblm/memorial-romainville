import mongoose, { InferSchemaType, Schema } from "mongoose";
import { COMMUNITY_STATUSES } from "../types/common";

const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    text: { type: String, required: true },
    status: { type: String, enum: [...COMMUNITY_STATUSES], default: "publie" },
    reports: [
      {
        _id: false,
        by: { type: Schema.Types.ObjectId, ref: "Member", required: true },
        reason: { type: String, required: true },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export type IComment = InferSchemaType<typeof commentSchema>;

const commentModel = mongoose.model("Comment", commentSchema);

export default commentModel;
