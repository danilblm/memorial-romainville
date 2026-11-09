import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel";
import { UserRole } from "../types/common";

interface LoginParams {
  email: string;
  password: string;
}

export const login = async ({ email, password }: LoginParams) => {
  const user = await userModel.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { data: "Incorrect email or password", statusCode: 400 };
  }

  return {
    data: {
      token: generateJWT({ email: user.email, role: user.role }),
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
    },
    statusCode: 200,
  };
};

interface CreateUserParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

// Réservé à l'admin : créer un compte modérateur pour un membre du groupe
export const createUser = async (params: CreateUserParams) => {
  if (await userModel.findOne({ email: params.email })) {
    return { data: "User already exists", statusCode: 400 };
  }

  const user = await userModel.create({
    ...params,
    password: await bcrypt.hash(params.password, 10),
  });

  return { data: { email: user.email, role: user.role }, statusCode: 201 };
};

// Crée le premier compte admin à partir du .env (ADMIN_EMAIL / ADMIN_PASSWORD)
export const ensureAdminUser = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin account created");
    return;
  }

  if (await userModel.findOne({ email })) return;

  await createUser({ firstName: "Admin", lastName: "Mémorial", email, password, role: "admin" });
  console.log(`Admin account created for ${email}`);
};

// --- Gestion des comptes de l'équipe (admin) ---

const PUBLIC_USER_FIELDS = "firstName lastName email role createdAt";

export const listUsers = async () => {
  return await userModel.find().select(PUBLIC_USER_FIELDS).sort({ lastName: 1, firstName: 1 }).lean();
};

const countAdmins = () => userModel.countDocuments({ role: "admin" });

interface UpdateUserParams {
  role?: UserRole;
  password?: string;
}

export const updateUser = async (id: string, params: UpdateUserParams, currentUserId: string) => {
  const user = await userModel.findById(id);
  if (!user) return { data: "User not found", statusCode: 404 };

  if (params.role && params.role !== user.role && user.role === "admin") {
    if (id === currentUserId) return { data: "You cannot remove your own admin role", statusCode: 400 };
    if ((await countAdmins()) <= 1) return { data: "At least one admin is required", statusCode: 400 };
  }

  if (params.role) user.role = params.role;
  if (params.password) user.password = await bcrypt.hash(params.password, 10);
  await user.save();

  return {
    data: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    statusCode: 200,
  };
};

export const deleteUser = async (id: string, currentUserId: string) => {
  if (id === currentUserId) return { data: "You cannot delete your own account", statusCode: 400 };

  const user = await userModel.findById(id);
  if (!user) return { data: "User not found", statusCode: 404 };
  if (user.role === "admin" && (await countAdmins()) <= 1) {
    return { data: "At least one admin is required", statusCode: 400 };
  }

  await user.deleteOne();
  return { data: { deleted: true }, statusCode: 200 };
};

// Chaque membre peut changer son propre mot de passe
export const changeOwnPassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await userModel.findById(userId);
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return { data: "Incorrect current password", statusCode: 400 };
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return { data: { updated: true }, statusCode: 200 };
};

const generateJWT = (data: object) => {
  return jwt.sign(data, process.env.JWT_SECRET || "", { expiresIn: "8h" });
};
