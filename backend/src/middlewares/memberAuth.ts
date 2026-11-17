import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import memberModel from "../models/memberModel";
import { ExtendRequest } from "../types/extendedRequest";

// Jetons des membres de la communauté : { kind: "member", id }
export const generateMemberJWT = (id: string) =>
  jwt.sign({ kind: "member", id }, process.env.JWT_SECRET || "", { expiresIn: "30d" });

const readMember = async (req: ExtendRequest) => {
  const token = req.get("authorization")?.split(" ")[1];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "");
    if (typeof payload === "string" || payload.kind !== "member" || !payload.id) return null;
    const member = await memberModel.findById(payload.id);
    if (!member || member.suspended) return null;
    return member;
  } catch {
    return null;
  }
};

// Membre connecté obligatoire
export const requireMember = async (req: ExtendRequest, res: Response, next: NextFunction) => {
  const member = await readMember(req);
  if (!member) {
    res.status(401).send({ message: "Connexion requise" });
    return;
  }
  req.member = member;
  next();
};

// Membre connecté facultatif (pour savoir si « j'aime » déjà une publication)
export const optionalMember = async (req: ExtendRequest, _res: Response, next: NextFunction) => {
  req.member = await readMember(req);
  next();
};
