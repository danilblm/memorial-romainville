import { isValidObjectId } from "mongoose";
import personModel from "../models/personModel";
import testimonyModel from "../models/testimonyModel";
import { onlyValidatedClaims, PUBLIC_PERSON_FILTER, PUBLISHED } from "./publicFilters";

const SUMMARY_FIELDS = "displayName photo roles arrivalAtFort departureFromFort publication status";

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

// Fiche en vérification : seulement le nom et la date d'arrivée, en attendant la validation de l'équipe.
const toPending = (person: { _id: unknown; displayName: string; arrivalAtFort?: unknown }) => ({
  _id: person._id,
  displayName: person.displayName,
  arrivalAtFort: person.arrivalAtFort,
  status: "en_verification",
});

const toPublicSummary = <
  T extends { _id: unknown; displayName: string; arrivalAtFort?: unknown; publication?: { visibility?: string | null } | null; status?: string | null }
>(
  person: T
) => {
  if (person.status !== "valide") return toPending(person);
  return person.publication?.visibility === "reservee" ? toReserved(person) : person;
};

export const listPublicPersons = async () => {
  const persons = await personModel.find(PUBLIC_PERSON_FILTER).select(SUMMARY_FIELDS).lean();

  return persons.map(toPublicSummary);
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

  if (person.status !== "valide") return toPending(person);
  if (person.publication?.visibility === "reservee") return toReserved(person);

  const testimonies = await testimonyModel
    .find({ persons: id, ...PUBLISHED, "publication.visibility": "publique" })
    .select("witnessName witnessRelation medium recordedAt")
    .lean();

  return { ...onlyValidatedClaims(person), testimonies };
};
