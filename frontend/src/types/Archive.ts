import { ContributionTarget } from "./Contribution";

// Contribution du public validée par l'équipe et publiée avec l'accord de son auteur
export interface PublishedArchive {
  _id: string;
  contributor: { name: string; relation?: string };
  target: { kind: ContributionTarget; label?: string };
  content: string;
  declaredProvenance: string;
  files: { index: number; originalName: string; mimeType: string; size?: number }[];
  publishedAt: string;
  createdAt: string;
}
