import eventModel from "../models/eventModel";
import { onlyValidatedClaims, PUBLIC_PERSON_FILTER, PUBLISHED } from "./publicFilters";

export const listPublicEvents = async (period?: string) => {
  const filter: Record<string, unknown> = { ...PUBLISHED };
  if (period) filter.period = period;

  const events = await eventModel
    .find(filter)
    .sort({ "start.date": 1 })
    .populate({ path: "places", match: PUBLISHED, select: "code name" })
    .populate({ path: "persons", match: PUBLIC_PERSON_FILTER, select: "displayName" })
    .populate({ path: "sources", match: PUBLISHED })
    .lean();

  return events.map(onlyValidatedClaims);
};

export const listPeriods = async () => {
  const periods = await eventModel.distinct("period", PUBLISHED);
  return periods.filter(Boolean).sort();
};
