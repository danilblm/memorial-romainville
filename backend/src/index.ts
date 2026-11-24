import dotenv from "dotenv";

import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import adminRoute from "./routes/adminRoute";
import communityRoute from "./routes/communityRoute";
import contributionRoute from "./routes/contributionRoute";
import eventRoute from "./routes/eventRoute";
import personRoute from "./routes/personRoute";
import placeRoute from "./routes/placeRoute";
import settingsRoute from "./routes/settingsRoute";
import sourceRoute from "./routes/sourceRoute";
import testimonyRoute from "./routes/testimonyRoute";
import userRoute from "./routes/userRoute";
import { seedCommunityExamples } from "./seed/communityExamples";
import { seedExampleData } from "./seed/exampleData";
import { ensureAdminUser } from "./services/userService";
import { sendStoredFile } from "./storage/fileStore";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set: team login will not be secure");
}

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());
// Adresses du site autorisées à appeler l'API (plusieurs possibles, séparées par des virgules)
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));

// Petite route de contrôle pour l'hébergeur
app.get("/health", (_req, res) => {
  res.send({ ok: true, database: mongoose.connection.readyState === 1 });
});

mongoose
  .connect(process.env.DATABASE_URL || "")
  .then(async () => {
    console.log("Mongo connected!");
    await ensureAdminUser();
    await seedExampleData();
    await seedCommunityExamples();
  })
  .catch((err) => console.log("Failed to connect!", err));

app.use("/persons", personRoute);
app.use("/events", eventRoute);
app.use("/places", placeRoute);
app.use("/testimonies", testimonyRoute);
app.use("/sources", sourceRoute);
app.use("/settings", settingsRoute);
app.use("/contributions", contributionRoute);
app.use("/user", userRoute);
app.use("/admin", adminRoute);
app.use("/community", communityRoute);

// Photos, audio, vidéos et plan publiés par l'équipe (rangés dans la base)
app.get("/media/:name", (req, res) => {
  sendStoredFile(res, "media", req.params.name).catch(() => !res.headersSent && res.status(500).end());
});

// Images publiées par les membres de la communauté
app.get("/community-media/:name", (req, res) => {
  sendStoredFile(res, "community", req.params.name).catch(() => !res.headersSent && res.status(500).end());
});

// Fichier trop lourd ou refusé : message clair plutôt qu'une page d'erreur
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(400).send({ message: err.code === "LIMIT_FILE_SIZE" ? "Fichier trop lourd" : "Fichier refusé" });
    return;
  }
  next(err);
});

app.listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}`);
});
