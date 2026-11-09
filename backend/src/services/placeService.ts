import personModel from "../models/personModel";
import placeModel from "../models/placeModel";
import testimonyModel from "../models/testimonyModel";
import { onlyValidatedClaims, PUBLIC_PERSON_FILTER, PUBLISHED } from "./publicFilters";

export const listPublicPlaces = async () => {
  return await placeModel.find(PUBLISHED).select("code kind name position geo").lean();
};

export const getPublicPlace = async (code: string) => {
  const place = await placeModel
    .findOne({ code, ...PUBLISHED })
    .populate({ path: "sources", match: PUBLISHED })
    .populate({ path: "photos.source", match: PUBLISHED })
    .lean();

  if (!place) return null;

  const [persons, testimonies] = await Promise.all([
    personModel
      .find({ ...PUBLIC_PERSON_FILTER, places: place._id })
      .select("displayName publication")
      .lean(),
    testimonyModel
      .find({ places: place._id, ...PUBLISHED, "publication.visibility": "publique" })
      .select("witnessName witnessRelation medium recordedAt")
      .lean(),
  ]);

  return { ...onlyValidatedClaims(place), persons, testimonies };
};
