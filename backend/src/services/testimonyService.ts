import { isValidObjectId } from "mongoose";
import testimonyModel from "../models/testimonyModel";
import { PUBLIC_PERSON_FILTER, PUBLISHED } from "./publicFilters";

export const getPublicTestimony = async (id: string) => {
  if (!isValidObjectId(id)) return null;

  return await testimonyModel
    .findOne({ _id: id, ...PUBLISHED, "publication.visibility": "publique" })
    .populate({ path: "persons", match: PUBLIC_PERSON_FILTER, select: "displayName" })
    .populate({ path: "places", match: PUBLISHED, select: "code name" })
    .populate({ path: "sources", match: PUBLISHED })
    .lean();
};
