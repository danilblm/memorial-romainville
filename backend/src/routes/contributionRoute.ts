import express from "express";
import { upload } from "../middlewares/upload";
import requireRole from "../middlewares/requireRole";
import validateJWT from "../middlewares/validateJWT";
import {
  createContribution,
  decideContribution,
  getContributionFile,
  getPublishedContribution,
  getPublishedContributionFile,
  listContributions,
  listPublishedContributions,
} from "../services/contributionService";
import { CONTRIBUTION_TARGETS, VALIDATION_STATUSES, ValidationStatus } from "../types/common";
import { ExtendRequest } from "../types/extendedRequest";
import { contributionInputSchema, decisionSchema } from "../validators/contributionSchemas";

const router = express.Router();

// Public : proposer une contribution (fichiers dans le champ "files")
router.post("/", upload.array("files", 5), async (req, res) => {
  try {
    const parsed = contributionInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send(parsed.error.flatten());
      return;
    }
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const contribution = await createContribution(parsed.data, files);
    res.status(201).send(contribution);
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

// Public : archives publiées (contributions validées dont l'auteur a accepté la publication)
router.get("/published", async (req, res) => {
  try {
    const kind = CONTRIBUTION_TARGETS.find((k) => k === req.query.kind);
    const q = typeof req.query.q === "string" ? req.query.q.trim() : undefined;
    res.status(200).send(await listPublishedContributions({ kind, q: q || undefined }));
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

router.get("/published/:id", async (req, res) => {
  try {
    const item = await getPublishedContribution(req.params.id);
    if (!item) {
      res.status(404).send("Not found");
      return;
    }
    res.status(200).send(item);
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

// Public : fichier d'une archive publiée (affiché dans la page, pas forcément téléchargé)
router.get("/published/:id/files/:index", async (req, res) => {
  try {
    const file = await getPublishedContributionFile(req.params.id, Number(req.params.index));
    if (!file) {
      res.status(404).send("Not found");
      return;
    }
    res.type(file.mimeType);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.sendFile(file.absolutePath, (err) => {
      if (err && !res.headersSent) res.status(404).send("Not found");
    });
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

// Équipe : lister les contributions (?status=propose)
router.get("/", validateJWT, requireRole("admin", "moderateur"), async (req, res) => {
  try {
    const status = VALIDATION_STATUSES.find((s) => s === req.query.status) as
      | ValidationStatus
      | undefined;
    res.status(200).send(await listContributions(status));
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

// Équipe : décider (en vérification, validée, refusée) avec un motif obligatoire
router.patch(
  "/:id/decision",
  validateJWT,
  requireRole("admin", "moderateur"),
  async (req: ExtendRequest, res) => {
    try {
      const parsed = decisionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).send(parsed.error.flatten());
        return;
      }
      const updated = await decideContribution(req.params.id, parsed.data, req.user?._id);
      if (!updated) {
        res.status(404).send("Not found");
        return;
      }
      res.status(200).send(updated);
    } catch {
      res.status(500).send("Something went wrong!");
    }
  }
);

// Équipe : télécharger un fichier joint
router.get(
  "/:id/files/:index",
  validateJWT,
  requireRole("admin", "moderateur"),
  async (req, res) => {
    try {
      const file = await getContributionFile(req.params.id, Number(req.params.index));
      if (!file) {
        res.status(404).send("Not found");
        return;
      }
      res.type(file.mimeType);
      res.download(file.absolutePath, file.originalName);
    } catch {
      res.status(500).send("Something went wrong!");
    }
  }
);

export default router;
