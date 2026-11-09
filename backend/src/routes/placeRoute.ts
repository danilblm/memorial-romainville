import express from "express";
import { getPublicPlace, listPublicPlaces } from "../services/placeService";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    res.status(200).send(await listPublicPlaces());
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

router.get("/:code", async (req, res) => {
  try {
    const place = await getPublicPlace(req.params.code);
    if (!place) {
      res.status(404).send("Not found");
      return;
    }
    res.status(200).send(place);
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

export default router;
