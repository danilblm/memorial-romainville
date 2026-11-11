import { Claim, FuzzyDate, LocalizedText, Publication } from "./common";
import { EventSummary } from "./Event";
import { PlaceSummary } from "./Place";
import { Source } from "./Source";
import { TestimonySummary } from "./Testimony";

export interface PersonSummary {
  _id: string;
  displayName: string;
  photo?: string;
  roles?: string[];
  arrivalAtFort?: FuzzyDate;
  departureFromFort?: FuzzyDate;
  publication?: Publication;
  status?: string;
}

export interface Person extends PersonSummary {
  nameVariants?: string[];
  biography?: LocalizedText;
  birth?: FuzzyDate;
  death?: FuzzyDate;
  places?: PlaceSummary[];
  events?: EventSummary[];
  sources?: Source[];
  claims?: Claim[];
  missingInfo?: LocalizedText[];
  testimonies?: TestimonySummary[];
}
