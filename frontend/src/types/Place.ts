import { Claim, LocalizedText } from "./common";
import { PersonSummary } from "./Person";
import { Source } from "./Source";
import { TestimonySummary } from "./Testimony";

export interface PlaceSummary {
  _id: string;
  code: string;
  kind?: string;
  name: LocalizedText;
  position?: { x?: number; y?: number };
}

export interface PlacePhoto {
  _id: string;
  url: string;
  caption?: LocalizedText;
  source?: Source;
}

export interface Place extends PlaceSummary {
  description?: LocalizedText;
  currentState?: LocalizedText;
  photos?: PlacePhoto[];
  sources?: Source[];
  claims?: Claim[];
  missingInfo?: LocalizedText[];
  persons?: PersonSummary[];
  testimonies?: TestimonySummary[];
}
