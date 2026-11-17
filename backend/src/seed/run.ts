// Lancement manuel : npm run seed
import dotenv from "dotenv";
import mongoose from "mongoose";
import { ensureAdminUser } from "../services/userService";
import { seedCommunityExamples } from "./communityExamples";
import { seedExampleData } from "./exampleData";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.DATABASE_URL || "");
  await ensureAdminUser();
  await seedExampleData();
  await seedCommunityExamples();
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
