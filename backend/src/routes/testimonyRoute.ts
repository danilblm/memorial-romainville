import express from "express";
import { getPublicTestimony } from "../services/testimonyService";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const testimony = await getPublicTestimony(req.params.id);
    if (!testimony) {
      res.status(404).send("Not found");
      return;
    }
    res.status(200).send(testimony);
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

export default router;
