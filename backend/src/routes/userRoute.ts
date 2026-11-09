import express from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import requireRole from "../middlewares/requireRole";
import validateJWT from "../middlewares/validateJWT";
import {
  changeOwnPassword,
  createUser,
  deleteUser,
  listUsers,
  login,
  updateUser,
} from "../services/userService";
import { USER_ROLES } from "../types/common";
import { ExtendRequest } from "../types/extendedRequest";

const router = express.Router();

const PASSWORD = z.string().min(10, "Password must be at least 10 characters");

const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send("Invalid body");
      return;
    }
    const { statusCode, data } = await login(parsed.data);
    res.status(statusCode).send(data);
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

// Membre connecté : changer son propre mot de passe
const ownPasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: PASSWORD });

router.patch("/me/password", validateJWT, async (req: ExtendRequest, res) => {
  try {
    const parsed = ownPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send({ message: parsed.error.issues[0]?.message ?? "Invalid body" });
      return;
    }
    const { statusCode, data } = await changeOwnPassword(
      String(req.user?._id),
      parsed.data.currentPassword,
      parsed.data.newPassword
    );
    res.status(statusCode).send(typeof data === "string" ? { message: data } : data);
  } catch {
    res.status(500).send({ message: "Something went wrong!" });
  }
});

// --- Admin : gestion des comptes de l'équipe ---

router.get("/", validateJWT, requireRole("admin"), async (_req, res) => {
  try {
    res.status(200).send(await listUsers());
  } catch {
    res.status(500).send({ message: "Something went wrong!" });
  }
});

const createUserSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: PASSWORD,
  role: z.enum(USER_ROLES),
});

router.post("/", validateJWT, requireRole("admin"), async (req, res) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send({ message: parsed.error.issues[0]?.message ?? "Invalid body" });
      return;
    }
    const { statusCode, data } = await createUser(parsed.data);
    res.status(statusCode).send(typeof data === "string" ? { message: data } : data);
  } catch {
    res.status(500).send({ message: "Something went wrong!" });
  }
});

const updateUserSchema = z
  .object({ role: z.enum(USER_ROLES).optional(), password: PASSWORD.optional() })
  .refine((value) => value.role || value.password, "Nothing to update");

router.patch("/:id", validateJWT, requireRole("admin"), async (req: ExtendRequest, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(404).send({ message: "User not found" });
      return;
    }
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send({ message: parsed.error.issues[0]?.message ?? "Invalid body" });
      return;
    }
    const { statusCode, data } = await updateUser(req.params.id, parsed.data, String(req.user?._id));
    res.status(statusCode).send(typeof data === "string" ? { message: data } : data);
  } catch {
    res.status(500).send({ message: "Something went wrong!" });
  }
});

router.delete("/:id", validateJWT, requireRole("admin"), async (req: ExtendRequest, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(404).send({ message: "User not found" });
      return;
    }
    const { statusCode, data } = await deleteUser(req.params.id, String(req.user?._id));
    res.status(statusCode).send(typeof data === "string" ? { message: data } : data);
  } catch {
    res.status(500).send({ message: "Something went wrong!" });
  }
});

export default router;
