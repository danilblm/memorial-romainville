import { FC, PropsWithChildren, useCallback, useEffect, useState } from "react";
import { apiGet } from "../../api/client";
import { Member } from "../../types/Community";
import { MemberContext } from "./MemberContext";

const TOKEN_KEY = "memberToken";
const MEMBER_KEY = "member";

const readStorage = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const member = localStorage.getItem(MEMBER_KEY);
    return { token, member: member ? (JSON.parse(member) as Member) : null };
  } catch {
    return { token: null, member: null };
  }
};

const save = (token: string | null, member: Member | null) => {
  try {
    if (token && member) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(MEMBER_KEY);
    }
  } catch {
    // stockage indisponible : la session reste en mémoire
  }
};

const MemberProvider: FC<PropsWithChildren> = ({ children }) => {
  const [{ token, member }, setSession] = useState(readStorage);

  const signIn = useCallback((nextToken: string, nextMember: Member) => {
    save(nextToken, nextMember);
    setSession({ token: nextToken, member: nextMember });
  }, []);

  const signOut = useCallback(() => {
    save(null, null);
    setSession({ token: null, member: null });
  }, []);

  const updateMember = useCallback(
    (nextMember: Member) => {
      save(token, nextMember);
      setSession({ token, member: nextMember });
    },
    [token]
  );

  // Au chargement : le jeton est-il toujours valable (expiré, compte suspendu) ?
  useEffect(() => {
    if (!token) return;
    apiGet<Member>("/community/me", token)
      .then((fresh) => {
        save(token, fresh);
        setSession({ token, member: fresh });
      })
      .catch((err: { status?: number }) => {
        if (err.status === 401) signOut();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MemberContext.Provider value={{ member, token, isMember: Boolean(token && member), signIn, updateMember, signOut }}>
      {children}
    </MemberContext.Provider>
  );
};

export default MemberProvider;
