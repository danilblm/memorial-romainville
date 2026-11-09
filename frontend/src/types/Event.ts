import { Claim, FuzzyDate, LocalizedText } from "./common";
import { PersonSummary } from "./Person";
import { PlaceSummary } from "./Place";
import { Source } from "./Source";

export interface EventSummary {
  _id: string;
  title: LocalizedText;
  start?: FuzzyDate;
  period?: string;
}

export interface EventItem extends EventSummary {
  description?: LocalizedText;
  end?: FuzzyDate;
  places?: PlaceSummary[];
  persons?: PersonSummary[];
  sources?: Source[];
  claims?: Claim[];
}
