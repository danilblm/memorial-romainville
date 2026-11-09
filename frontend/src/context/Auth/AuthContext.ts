import { createContext, useContext } from "react";

export type UserRole = "admin" | "moderateur";

interface AuthContextType {
  username: string | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (username: string, token: string, role: UserRole) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  username: null,
  token: null,
  role: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);
