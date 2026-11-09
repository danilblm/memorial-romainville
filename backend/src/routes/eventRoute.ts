import express from "express";
import { listPeriods, listPublicEvents } from "../services/eventService";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const period = typeof req.query.period === "string" ? req.query.period : undefined;
    const events = await listPublicEvents(period);
    res.status(200).send(events);
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

router.get("/periods", async (_req, res) => {
  try {
    res.status(200).send(await listPeriods());
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

export default router;
