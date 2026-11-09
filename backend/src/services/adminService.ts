import { isValidObjectId, Model } from "mongoose";
import eventModel from "../models/eventModel";
import personModel from "../models/personModel";
import placeModel from "../models/placeModel";
import sourceModel from "../models/sourceModel";
import testimonyModel from "../models/testimonyModel";
import { ValidationStatus } from "../types/common";

// Fiches gérées par l'interface d'administration.
// label  : champ affiché dans les listes et les sélecteurs
// search : champs utilisés par la recherche
interface AdminEntity {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  label: string;
  search: string[];
}

const ADMIN_ENTITIES: Record<string, AdminEntity> = {
  persons: { model: personModel, label: "displayName", search: ["displayName", "nameVariants"] },
  places: { model: placeModel, label: "name.fr", search: ["name.fr", "code"] },
  events: { model: eventModel, label: "title.fr", search: ["title.fr", "period"] },
  sources: { model: sourceModel, label: "title.fr", search: ["title.fr", "reference", "holder"] },
  testimonies: { model: testimonyModel, label: "witnessName", search: ["witnessName", "witnessRelation"] },
};

export const getAdminEntity = (name: string) =>
  Object.prototype.hasOwnProperty.call(ADMIN_ENTITIES, name) ? ADMIN_ENTITIES[name] : undefined;

// Champs que le client ne peut jamais écrire
const PROTECTED_FIELDS = ["_id", "__v", "createdAt", "updatedAt"];

const clean = (body: unknown) =>
  Object.fromEntries(
    Object.entries((body ?? {}) as Record<string, unknown>).filter(([key]) => !PROTECTED_FIELDS.includes(key))
  );

const readPath = (doc: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], doc);

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

interface ListParams {
  status?: ValidationStatus;
  q?: string;
}

export const listDocuments = async (entity: AdminEntity, { status, q }: ListParams) => {
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    filter.$or = entity.search.map((field) => ({ [field]: pattern }));
  }

  const docs = await entity.model
    .find(filter)
    .sort({ updatedAt: -1 })
    .select(`${entity.label} status updatedAt`)
    .lean();

  return docs.map((doc) => ({
    _id: doc._id,
    label: readPath(doc, entity.label) ?? "",
    status: doc.status,
    updatedAt: doc.updatedAt,
  }));
};

// Pour les sélecteurs de liens (toutes les fiches, triées par nom)
export const listOptions = async (entity: AdminEntity) => {
  const docs = await entity.model.find().select(`${entity.label} status`).lean();
  return docs
    .map((doc) => ({ _id: doc._id, label: String(readPath(doc, entity.label) ?? ""), status: doc.status }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));
};

export const getDocument = async (entity: AdminEntity, id: string) => {
  if (!isValidObjectId(id)) return null;
  return await entity.model.findById(id).lean();
};

export const createDocument = async (entity: AdminEntity, body: unknown) => {
  const doc = await entity.model.create(clean(body));
  return doc.toObject();
};

export const updateDocument = async (entity: AdminEntity, id: string, body: unknown) => {
  if (!isValidObjectId(id)) return null;
  const doc = await entity.model.findById(id);
  if (!doc) return null;
  doc.set(clean(body));
  await doc.save();
  return doc.toObject();
};

export const deleteDocument = async (entity: AdminEntity, id: string) => {
  if (!isValidObjectId(id)) return null;
  return await entity.model.findByIdAndDelete(id).lean();
};
