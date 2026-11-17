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

// --- Archives publiées (public) ---
// Une contribution n'est visible que si l'équipe l'a validée ET que la personne a accepté la publication.
const PUBLISHED_FILTER = { status: "valide", consentToPublish: true } as const;

// « Marie Dupont » → « Marie D. » : on ne publie jamais le nom complet ni l'e-mail
export const publicName = (name?: string | null) => {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Anonyme";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
};

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toPublicArchive = (doc: any) => {
  return {
    _id: doc._id,
    contributor: { name: publicName(doc.contributor?.name), relation: doc.contributor?.relation },
    target: doc.target,
    content: doc.content,
    declaredProvenance: doc.declaredProvenance,
    files: (doc.files ?? []).map((file: any, index: number) => ({
      index,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
    })),
    publishedAt: doc.decision?.at ?? doc.updatedAt,
    createdAt: doc.createdAt,
  };
};

export const listPublishedContributions = async (filters: { kind?: string; q?: string }) => {
  const query: Record<string, unknown> = { ...PUBLISHED_FILTER };
  if (filters.kind) query["target.kind"] = filters.kind;
  if (filters.q) {
    const pattern = new RegExp(escapeRegex(filters.q.slice(0, 100)), "i");
    query.$or = [{ content: pattern }, { "target.label": pattern }, { declaredProvenance: pattern }];
  }
  const items = await contributionModel.find(query).sort({ "decision.at": -1, createdAt: -1 }).limit(200).lean();
  return items.map(toPublicArchive);
};

export const getPublishedContribution = async (id: string) => {
  if (!isValidObjectId(id)) return null;
  const item = await contributionModel.findOne({ _id: id, ...PUBLISHED_FILTER }).lean();
  return item ? toPublicArchive(item) : null;
};

export const getPublishedContributionFile = async (id: string, index: number) => {
  if (!isValidObjectId(id)) return null;
  const item = await contributionModel.findOne({ _id: id, ...PUBLISHED_FILTER }).lean();
  const file = item?.files?.[index];
  if (!file) return null;
  return {
    absolutePath: path.join(UPLOAD_DIR, path.basename(file.storedName)),
    originalName: file.originalName,
    mimeType: file.mimeType,
  };
};
