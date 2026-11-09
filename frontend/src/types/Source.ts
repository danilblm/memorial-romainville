import { FuzzyDate, LocalizedText } from "./common";

export interface Source {
  _id: string;
  type: string;
  title: LocalizedText;
  holder?: string;
  reference?: string;
  url?: string;
  fileUrl?: string;
  date?: FuzzyDate;
  author?: string;
  rights?: string;
}
