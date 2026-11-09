import { z } from "zod";
import { CONTRIBUTION_TARGETS } from "../types/common";

// Les champs arrivent en multipart/form-data : tout est une chaîne.
export const contributionInputSchema = z.object({
  contributorName: z.string().trim().min(1).max(200),
  contributorEmail: z.string().trim().email(),
  contributorRelation: z.string().trim().max(300).optional(),
  targetKind: z.enum(CONTRIBUTION_TARGETS),
  targetLabel: z.string().trim().max(300).optional(),
  content: z.string().trim().min(10).max(10000),
  declaredProvenance: z.string().trim().min(3).max(2000),
  consentToPublish: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export type ContributionInput = z.infer<typeof contributionInputSchema>;

export const decisionSchema = z.object({
  status: z.enum(["en_verification", "valide", "refuse"]),
  reason: z.string().trim().min(3).max(2000),
});

export type DecisionInput = z.infer<typeof decisionSchema>;
