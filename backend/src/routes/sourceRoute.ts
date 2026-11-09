import express from "express";
import { getPublicSource } from "../services/sourceService";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const source = await getPublicSource(req.params.id);
    if (!source) {
      res.status(404).send("Not found");
      return;
    }
    res.status(200).send(source);
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

export default router;
