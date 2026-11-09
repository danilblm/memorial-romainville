import mongoose, { HydratedDocument, InferSchemaType, Schema } from "mongoose";
import { USER_ROLES } from "../types/common";

// Membres de l'équipe (admin, modérateurs). Le public n'a pas de compte.
const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: [...USER_ROLES], default: "moderateur" },
  },
  { timestamps: true }
);

export type IUser = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<IUser>;

const userModel = mongoose.model("User", userSchema);

export default userModel;
