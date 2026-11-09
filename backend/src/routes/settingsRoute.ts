import express from "express";
import { getSettings } from "../services/settingsService";

const router = express.Router();

// Public : réglages nécessaires à l'affichage (plan du fort)
router.get("/", async (_req, res) => {
  try {
    res.status(200).send(await getSettings());
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

export default router;
