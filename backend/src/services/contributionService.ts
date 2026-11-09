import { isValidObjectId } from "mongoose";
import path from "path";
import { UPLOAD_DIR } from "../middlewares/upload";
import contributionModel from "../models/contributionModel";
import { ValidationStatus } from "../types/common";
import { ContributionInput, DecisionInput } from "../validators/contributionSchemas";

export const createContribution = async (
  input: ContributionInput,
  files: Express.Multer.File[]
) => {
  const contribution = await contributionModel.create({
    contributor: {
      name: input.contributorName,
      email: input.contributorEmail,
      relation: input.contributorRelation,
    },
    target: { kind: input.targetKind, label: input.targetLabel },
    content: input.content,
    declaredProvenance: input.declaredProvenance,
    consentToPublish: input.consentToPublish,
    files: files.map((file) => ({
      storedName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    })),
    status: "propose",
  });

  // On ne renvoie au public que l'identifiant et le statut
  return { _id: contribution._id, status: contribution.status };
};

export const listContributions = async (status?: ValidationStatus) => {
  return await contributionModel
    .find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .populate("decision.by", "firstName lastName")
    .lean();
};

export const decideContribution = async (id: string, decision: DecisionInput, userId: unknown) => {
  if (!isValidObjectId(id)) return null;

  return await contributionModel
    .findByIdAndUpdate(
      id,
      {
        status: decision.status,
        decision: { by: userId, at: new Date(), reason: decision.reason },
      },
      { new: true }
    )
    .lean();
};

export const getContributionFile = async (id: string, index: number) => {
  if (!isValidObjectId(id)) return null;

  const contribution = await contributionModel.findById(id).lean();
  const file = contribution?.files?.[index];
  if (!file) return null;

  return {
    absolutePath: path.join(UPLOAD_DIR, path.basename(file.storedName)),
    originalName: file.originalName,
    mimeType: file.mimeType,
  };
};
