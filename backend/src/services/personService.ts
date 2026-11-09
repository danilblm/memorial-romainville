import { isValidObjectId } from "mongoose";
import personModel from "../models/personModel";
import testimonyModel from "../models/testimonyModel";
import { onlyValidatedClaims, PUBLIC_PERSON_FILTER, PUBLISHED } from "./publicFilters";

const SUMMARY_FIELDS = "displayName photo roles arrivalAtFort departureFromFort publication";

// Fiche réservée : on respecte le refus d'exposition, on garde la trace de la présence.
const toReserved = (person: {
  _id: unknown;
  displayName: string;
  arrivalAtFort?: unknown;
  publication?: unknown;
}) => ({
  _id: person._id,
  displayName: person.displayName,
  arrivalAtFort: person.arrivalAtFort,
  publication: person.publication,
});

export const listPublicPersons = async () => {
  const persons = await personModel.find(PUBLIC_PERSON_FILTER).select(SUMMARY_FIELDS).lean();

  return persons.map((person) =>
    person.publication?.visibility === "reservee" ? toReserved(person) : person
  );
};

export const getPublicPerson = async (id: string) => {
  if (!isValidObjectId(id)) return null;

  const person = await personModel
    .findOne({ _id: id, ...PUBLIC_PERSON_FILTER })
    .populate({ path: "places", match: PUBLISHED, select: "code name kind" })
    .populate({ path: "events", match: PUBLISHED, select: "title start period" })
    .populate({ path: "sources", match: PUBLISHED })
    .lean();

  if (!person) return null;

  if (person.publication?.visibility === "reservee") return toReserved(person);

  const testimonies = await testimonyModel
    .find({ persons: id, ...PUBLISHED, "publication.visibility": "publique" })
    .select("witnessName witnessRelation medium recordedAt")
    .lean();

  return { ...onlyValidatedClaims(person), testimonies };
};
