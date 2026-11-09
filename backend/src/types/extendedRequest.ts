import { Request } from "express";
import { UserDocument } from "../models/userModel";

export interface ExtendRequest extends Request {
  user?: UserDocument | null;
}
