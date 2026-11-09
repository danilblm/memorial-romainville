import { isValidObjectId } from "mongoose";
import sourceModel from "../models/sourceModel";
import { PUBLISHED } from "./publicFilters";

export const getPublicSource = async (id: string) => {
  if (!isValidObjectId(id)) return null;
  return await sourceModel.findOne({ _id: id, ...PUBLISHED }).lean();
};
