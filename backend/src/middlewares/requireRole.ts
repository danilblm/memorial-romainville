import { NextFunction, Response } from "express";
import { UserRole } from "../types/common";
import { ExtendRequest } from "../types/extendedRequest";

// À placer après validateJWT
const requireRole =
  (...roles: UserRole[]) =>
  (req: ExtendRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role as UserRole | undefined;

    if (!role || !roles.includes(role)) {
      res.status(403).send("Access denied");
      return;
    }

    next();
  };

export default requireRole;
