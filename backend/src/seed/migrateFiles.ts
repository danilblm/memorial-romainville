// Copie dans la base les fichiers encore rangés sur le disque (dossier uploads/).
//   npm run migrer-fichiers
// À lancer une fois ; les fichiers déjà présents dans la base sont ignorés.
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { FileKind, importFileFromDisk, LEGACY_DIR } from "../storage/fileStore";

dotenv.config();

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

const run = async () => {
  await mongoose.connect(process.env.DATABASE_URL || "mongodb://localhost:27017/memorial-romainville");
  let copied = 0;
  for (const kind of ["media", "contributions", "community"] as FileKind[]) {
    const dir = path.join(LEGACY_DIR, kind);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (!fs.statSync(full).isFile()) continue;
      const type = TYPES[path.extname(name).toLowerCase()] ?? "application/octet-stream";
      if (await importFileFromDisk(kind, full, type)) {
        copied += 1;
        console.log(`  ${kind}/${name}`);
      }
    }
  }
  console.log(`\n${copied} fichier(s) copié(s) dans la base.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
