import { FuzzyDate, LocalizedText } from "./common";
import { PersonSummary } from "./Person";
import { PlaceSummary } from "./Place";
import { Source } from "./Source";

export type TestimonyMedium = "ecrit" | "audio" | "video";

export interface TestimonySummary {
  _id: string;
  witnessName: string;
  witnessRelation: string;
  medium: TestimonyMedium;
  recordedAt?: FuzzyDate;
}

export interface Testimony extends TestimonySummary {
  livedEvents?: boolean;
  audience?: LocalizedText;
  collectedBy?: string;
  transformations?: string;
  originalLocation?: string;
  rights?: string;
  mediaUrl?: string;
  transcript?: LocalizedText;
  isExcerpt?: boolean;
  fullVersionUrl?: string;
  notCovered?: LocalizedText;
  persons?: PersonSummary[];
  places?: PlaceSummary[];
  sources?: Source[];
}
