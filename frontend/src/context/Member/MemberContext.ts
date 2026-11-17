import { createContext, useContext } from "react";
import { Member } from "../../types/Community";

// Session d'un membre de « la communauté du fort » (distincte de la connexion de l'équipe)
interface MemberContextType {
  member: Member | null;
  token: string | null;
  isMember: boolean;
  signIn: (token: string, member: Member) => void;
  updateMember: (member: Member) => void;
  signOut: () => void;
}

export const MemberContext = createContext<MemberContextType>({
  member: null,
  token: null,
  isMember: false,
  signIn: () => {},
  updateMember: () => {},
  signOut: () => {},
});

export const useMember = () => useContext(MemberContext);
