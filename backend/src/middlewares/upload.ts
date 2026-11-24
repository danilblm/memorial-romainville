import multer from "multer";
import { databaseStorage } from "../storage/fileStore";

// Les fichiers sont rangés dans la base de données (voir storage/fileStore.ts).

// --- Fichiers envoyés par le public (contributions) ---
// Ils ne sont PAS servis publiquement : seuls les modérateurs y accèdent,
// via /contributions/:id/files/:index (ou le public une fois la contribution publiée).
const CONTRIBUTION_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
];

export const upload = multer({
  storage: databaseStorage("contributions"),
  limits: { fileSize: 20 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => cb(null, CONTRIBUTION_TYPES.includes(file.mimetype)),
});

// --- Médias publiés par l'équipe (photos, audio, vidéo des fiches, plan du fort) ---
// Servis publiquement sur /media.
const MEDIA_TYPES = [...CONTRIBUTION_TYPES, "image/gif", "video/mp4", "video/webm", "audio/webm", "audio/ogg"];

export const mediaUpload = multer({
  storage: databaseStorage("media"),
  limits: { fileSize: 100 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, MEDIA_TYPES.includes(file.mimetype)),
});

// --- Images publiées par les membres de la communauté ---
// Servies publiquement sur /community-media (images uniquement).
export const communityUpload = multer({
  storage: databaseStorage("community"),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)),
});
