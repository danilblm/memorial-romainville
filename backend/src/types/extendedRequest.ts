import { Request } from "express";
import { MemberDocument } from "../models/memberModel";
import { UserDocument } from "../models/userModel";

export interface ExtendRequest extends Request {
  user?: UserDocument | null;
  member?: MemberDocument | null;
}
