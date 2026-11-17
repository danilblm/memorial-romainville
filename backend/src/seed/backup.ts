// Sauvegarde et restauration complètes du mémorial (base MongoDB + fichiers téléversés).
//
//   npm run sauvegarde     → crée le dossier backend/sauvegarde/ (à copier sur une clé ou un Drive)
//   npm run restauration   → remplace la base et les fichiers par ceux de backend/sauvegarde/
//
// La base et le dossier uploads/ ne sont pas sur GitHub : c'est le seul moyen de
// passer le plan du fort, les lieux, les photos et les fiches d'un ordinateur à l'autre.
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";

dotenv.config();

const ROOT = process.cwd();
const BACKUP_DIR = path.join(ROOT, "sauvegarde");
const UPLOADS_DIR = path.join(ROOT, "uploads");
const DATA_FILE = path.join(BACKUP_DIR, "base.json");

const { EJSON } = mongoose.mongo.BSON;

const copyDir = (from: string, to: string) => {
  if (!fs.existsSync(from)) return 0;
  fs.mkdirSync(to, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) count += copyDir(source, target);
    else {
      fs.copyFileSync(source, target);
      count += 1;
    }
  }
  return count;
};

const backup = async () => {
  const db = mongoose.connection.db!;
  const collections = await db.listCollections().toArray();
  const data: Record<string, unknown[]> = {};
  for (const { name } of collections) {
    if (name.startsWith("system.")) continue;
    data[name] = await db.collection(name).find().toArray();
    console.log(`  ${name} : ${data[name].length}`);
  }

  fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, EJSON.stringify(data, undefined, 2, { relaxed: false }));
  const files = copyDir(UPLOADS_DIR, path.join(BACKUP_DIR, "uploads"));

  console.log(`\nSauvegarde terminée : ${files} fichier(s) copiés.`);
  console.log(`Dossier à copier sur l'autre ordinateur : ${BACKUP_DIR}`);
};

const restore = async () => {
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`Aucune sauvegarde trouvée. Copiez le dossier « sauvegarde » dans ${ROOT} puis relancez.`);
    process.exitCode = 1;
    return;
  }
  const data = EJSON.parse(fs.readFileSync(DATA_FILE, "utf-8"), { relaxed: false }) as Record<string, Record<string, unknown>[]>;
  const db = mongoose.connection.db!;

  for (const [name, documents] of Object.entries(data)) {
    await db.collection(name).deleteMany({});
    if (documents.length > 0) await db.collection(name).insertMany(documents);
    console.log(`  ${name} : ${documents.length}`);
  }
  const files = copyDir(path.join(BACKUP_DIR, "uploads"), UPLOADS_DIR);

  console.log(`\nRestauration terminée : ${files} fichier(s) remis en place.`);
  console.log("Redémarrez le backend (npm run dev) si les nouveautés n'apparaissent pas.");
};

const run = async () => {
  const mode = process.argv[2];
  if (mode !== "backup" && mode !== "restore") {
    console.error("Usage : ts-node src/seed/backup.ts backup|restore");
    process.exitCode = 1;
    return;
  }
  await mongoose.connect(process.env.DATABASE_URL || "mongodb://localhost:27017/memorial-romainville");
  console.log(mode === "backup" ? "Sauvegarde de la base…" : "Restauration de la base…");
  try {
    await (mode === "backup" ? backup() : restore());
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
