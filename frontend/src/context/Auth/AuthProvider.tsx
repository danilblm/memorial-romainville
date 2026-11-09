import { FC, PropsWithChildren, useState } from "react";
import { AuthContext, UserRole } from "./AuthContext";

const USERNAME_KEY = "username";
const TOKEN_KEY = "token";
const ROLE_KEY = "role";

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(read(USERNAME_KEY));
  const [token, setToken] = useState<string | null>(read(TOKEN_KEY));
  const [role, setRole] = useState<UserRole | null>(read(ROLE_KEY) as UserRole | null);

  const isAuthenticated = !!token;

  const login = (username: string, token: string, role: UserRole) => {
    setUsername(username);
    setToken(token);
    setRole(role);
    try {
      localStorage.setItem(USERNAME_KEY, username);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ROLE_KEY, role);
    } catch {
      // stockage indisponible : la session reste en mémoire
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(USERNAME_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
    } catch {
      // rien à faire
    }
    setUsername(null);
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ username, token, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
