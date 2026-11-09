import express, { Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { updatePlan } from "../services/settingsService";
import { mediaUpload } from "../middlewares/upload";
import requireRole from "../middlewares/requireRole";
import validateJWT from "../middlewares/validateJWT";
import {
  createDocument,
  deleteDocument,
  getAdminEntity,
  getDocument,
  listDocuments,
  listOptions,
  updateDocument,
} from "../services/adminService";
import { VALIDATION_STATUSES, ValidationStatus } from "../types/common";

const router = express.Router();

// Toute l'administration est réservée à l'équipe
router.use(validateJWT, requireRole("admin", "moderateur"));

const handleError = (res: Response, err: unknown) => {
  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).send({
      message: "Validation failed",
      errors: Object.fromEntries(Object.entries(err.errors).map(([key, value]) => [key, value.message])),
    });
    return;
  }
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).send({ message: `Invalid value for ${err.path}` });
    return;
  }
  if ((err as { code?: number }).code === 11000) {
    res.status(409).send({ message: "This value already exists (duplicate)" });
    return;
  }
  console.error(err);
  res.status(500).send({ message: "Something went wrong!" });
};

// Téléverser une photo, un audio ou une vidéo pour une fiche
router.post("/media", mediaUpload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).send({ message: "Missing or unsupported file" });
    return;
  }
  res.status(201).send({ url: `/media/${req.file.filename}` });
});

// Réglages du site : plan du fort (admin uniquement)
const planSchema = z
  .object({
    url: z.string().trim().min(1).max(500),
    width: z.number().int().positive().max(20000),
    height: z.number().int().positive().max(20000),
  })
  .nullable();

router.put("/settings/plan", requireRole("admin"), async (req, res) => {
  const parsed = planSchema.safeParse(req.body?.plan ?? null);
  if (!parsed.success) {
    res.status(400).send({ message: parsed.error.issues[0]?.message ?? "Invalid plan" });
    return;
  }
  try {
    res.status(200).send(await updatePlan(parsed.data));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/:entity/options", async (req, res) => {
  const entity = getAdminEntity(req.params.entity);
  if (!entity) {
    res.status(404).send({ message: "Unknown entity" });
    return;
  }
  try {
    res.status(200).send(await listOptions(entity));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/:entity", async (req, res) => {
  const entity = getAdminEntity(req.params.entity);
  if (!entity) {
    res.status(404).send({ message: "Unknown entity" });
    return;
  }
  try {
    const status = VALIDATION_STATUSES.find((s) => s === req.query.status) as ValidationStatus | undefined;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : undefined;
    res.status(200).send(await listDocuments(entity, { status, q }));
  } catch (err) {
    handleError(res, err);
  }
});

router.get("/:entity/:id", async (req, res) => {
  const entity = getAdminEntity(req.params.entity);
  if (!entity) {
    res.status(404).send({ message: "Unknown entity" });
    return;
  }
  try {
    const doc = await getDocument(entity, req.params.id);
    if (!doc) {
      res.status(404).send({ message: "Not found" });
      return;
    }
    res.status(200).send(doc);
  } catch (err) {
    handleError(res, err);
  }
});

router.post("/:entity", async (req, res) => {
  const entity = getAdminEntity(req.params.entity);
  if (!entity) {
    res.status(404).send({ message: "Unknown entity" });
    return;
  }
  try {
    res.status(201).send(await createDocument(entity, req.body));
  } catch (err) {
    handleError(res, err);
  }
});

router.put("/:entity/:id", async (req, res) => {
  const entity = getAdminEntity(req.params.entity);
  if (!entity) {
    res.status(404).send({ message: "Unknown entity" });
    return;
  }
  try {
    const doc = await updateDocument(entity, req.params.id, req.body);
    if (!doc) {
      res.status(404).send({ message: "Not found" });
      return;
    }
    res.status(200).send(doc);
  } catch (err) {
    handleError(res, err);
  }
});

// Suppression définitive : réservée à l'admin
router.delete("/:entity/:id", requireRole("admin"), async (req, res) => {
  const entity = getAdminEntity(req.params.entity);
  if (!entity) {
    res.status(404).send({ message: "Unknown entity" });
    return;
  }
  try {
    const doc = await deleteDocument(entity, req.params.id);
    if (!doc) {
      res.status(404).send({ message: "Not found" });
      return;
    }
    res.status(200).send({ deleted: true });
  } catch (err) {
    handleError(res, err);
  }
});

export default router;
