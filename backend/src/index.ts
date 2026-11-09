import dotenv from "dotenv";

import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { MEDIA_DIR } from "./middlewares/upload";
import adminRoute from "./routes/adminRoute";
import contributionRoute from "./routes/contributionRoute";
import eventRoute from "./routes/eventRoute";
import personRoute from "./routes/personRoute";
import placeRoute from "./routes/placeRoute";
import sourceRoute from "./routes/sourceRoute";
import testimonyRoute from "./routes/testimonyRoute";
import userRoute from "./routes/userRoute";
import { seedExampleData } from "./seed/exampleData";
import { ensureAdminUser } from "./services/userService";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set: team login will not be secure");
}

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));

mongoose
  .connect(process.env.DATABASE_URL || "")
  .then(async () => {
    console.log("Mongo connected!");
    await ensureAdminUser();
    await seedExampleData();
  })
  .catch((err) => console.log("Failed to connect!", err));

app.use("/persons", personRoute);
app.use("/events", eventRoute);
app.use("/places", placeRoute);
app.use("/testimonies", testimonyRoute);
app.use("/sources", sourceRoute);
app.use("/contributions", contributionRoute);
app.use("/user", userRoute);
app.use("/admin", adminRoute);

// Photos, audio et vidéos publiés par l'équipe
app.use("/media", express.static(MEDIA_DIR));

app.listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}`);
});
