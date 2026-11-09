import express from "express";
import { getPublicPerson, listPublicPersons } from "../services/personService";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const persons = await listPublicPersons();
    res.status(200).send(persons);
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const person = await getPublicPerson(req.params.id);
    if (!person) {
      res.status(404).send("Not found");
      return;
    }
    res.status(200).send(person);
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

export default router;
