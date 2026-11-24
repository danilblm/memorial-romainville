import { Response } from "express";
import fs from "fs";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";

// Les fichiers téléversés (plan, photos, documents des contributions, images de la communauté)
// sont rangés DANS la base MongoDB (GridFS) et non sur le disque du serveur :
// un hébergeur gratuit efface son disque à chaque redémarrage, la base, elle, garde tout.

export type FileKind = "media" | "contributions" | "community";

const BUCKET = "files";

// Anciens fichiers enregistrés sur le disque (avant le passage à la base) : encore lus en secours
export const LEGACY_DIR = path.join(process.cwd(), "uploads");

const bucket = () => {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Base de données non connectée");
  return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET });
};

export const uniqueName = (originalName: string) =>
  `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(originalName).toLowerCase()}`;

const safeName = (name: string) => path.basename(name);

// Moteur multer : chaque fichier reçu part directement dans la base.
// `file.filename` garde le même rôle qu'avant (nom stocké), le reste du code ne change pas.
export const databaseStorage = (kind: FileKind): multer.StorageEngine => ({
  _handleFile(_req, file, cb) {
    const filename = uniqueName(file.originalname);
    let size = 0;
    const upload = bucket().openUploadStream(filename, {
      metadata: { kind, contentType: file.mimetype, originalName: file.originalname },
    });
    file.stream.on("data", (chunk: Buffer) => (size += chunk.length));
    file.stream
      .pipe(upload)
      .on("error", (err) => cb(err))
      .on("finish", () => cb(null, { filename, size }));
  },
  _removeFile(_req, file, cb) {
    deleteStoredFile(kind, file.filename)
      .then(() => cb(null))
      .catch((err) => cb(err));
  },
});

const findStored = async (kind: FileKind, filename: string) =>
  (await bucket().find({ filename: safeName(filename), "metadata.kind": kind }).limit(1).toArray())[0];

// Envoie un fichier au navigateur (affiché, ou téléchargé si `downloadName` est donné)
export const sendStoredFile = async (
  res: Response,
  kind: FileKind,
  filename: string,
  options: { mimeType?: string; downloadName?: string } = {}
) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  const stored = await findStored(kind, filename);

  if (stored) {
    res.type(options.mimeType ?? stored.metadata?.contentType ?? "application/octet-stream");
    res.setHeader("Cache-Control", kind === "contributions" ? "private, no-store" : "public, max-age=86400");
    if (options.downloadName) res.attachment(options.downloadName);
    bucket()
      .openDownloadStream(stored._id)
      .on("error", () => !res.headersSent && res.status(404).end())
      .pipe(res);
    return;
  }

  // Secours : fichier encore présent sur le disque (installation locale ancienne)
  const legacyPath = path.join(LEGACY_DIR, kind, safeName(filename));
  if (fs.existsSync(legacyPath)) {
    if (options.mimeType) res.type(options.mimeType);
    if (options.downloadName) res.download(legacyPath, options.downloadName);
    else res.sendFile(legacyPath);
    return;
  }

  res.status(404).send({ message: "Not found" });
};

export const deleteStoredFile = async (kind: FileKind, filename: string) => {
  const stored = await findStored(kind, filename);
  if (stored) await bucket().delete(stored._id);
};

// Copie dans la base un fichier présent sur le disque (migration des anciens fichiers)
export const importFileFromDisk = async (kind: FileKind, absolutePath: string, contentType: string) => {
  const filename = path.basename(absolutePath);
  if (await findStored(kind, filename)) return false;
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(absolutePath)
      .pipe(bucket().openUploadStream(filename, { metadata: { kind, contentType, originalName: filename } }))
      .on("error", reject)
      .on("finish", () => resolve());
  });
  return true;
};
