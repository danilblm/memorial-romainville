import fs from "fs";
import multer from "multer";
import path from "path";

const uniqueName = (originalName: string) =>
  `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(originalName).toLowerCase()}`;

// --- Fichiers envoyés par le public (contributions) ---
// Ils ne sont PAS servis publiquement : seuls les modérateurs y accèdent,
// via /contributions/:id/files/:index.
export const UPLOAD_DIR = path.join(process.cwd(), "uploads", "contributions");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

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
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, uniqueName(file.originalname)),
  }),
  limits: { fileSize: 20 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => cb(null, CONTRIBUTION_TYPES.includes(file.mimetype)),
});

// --- Médias publiés par l'équipe (photos, audio, vidéo des fiches) ---
// Servis publiquement sur /media.
export const MEDIA_DIR = path.join(process.cwd(), "uploads", "media");
fs.mkdirSync(MEDIA_DIR, { recursive: true });

const MEDIA_TYPES = [...CONTRIBUTION_TYPES, "image/gif", "video/mp4", "video/webm", "audio/webm", "audio/ogg"];

export const mediaUpload = multer({
  storage: multer.diskStorage({
    destination: MEDIA_DIR,
    filename: (_req, file, cb) => cb(null, uniqueName(file.originalname)),
  }),
  limits: { fileSize: 100 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, MEDIA_TYPES.includes(file.mimetype)),
});
