import { ValidationStatus } from "./common";

export type ContributionTarget = "person" | "place" | "event" | "source" | "autre";

export interface Contribution {
  _id: string;
  contributor: { name: string; email: string; relation?: string };
  target: { kind: ContributionTarget; label?: string };
  content: string;
  declaredProvenance: string;
  files: { _id: string; originalName: string; mimeType: string; size?: number }[];
  consentToPublish: boolean;
  status: ValidationStatus;
  decision?: {
    by?: { firstName: string; lastName: string };
    at?: string;
    reason?: string;
  };
  createdAt: string;
}
