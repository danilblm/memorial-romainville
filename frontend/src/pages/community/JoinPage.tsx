import { CircleAlert, LogIn, MessagesSquare, ShieldCheck, UserPlus, Users } from "lucide-react";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { apiSend, ApiError } from "../../api/client";
import { SelectInput, TextInput } from "../../components/FormField";
import { Button, Container, Eyebrow, Page } from "../../components/ui";
import { useMember } from "../../context/Member/MemberContext";
import { MEMBER_PROFILES, MemberSession } from "../../types/Community";
import { cn } from "../../utils/cn";

const PERKS = [
  { icon: MessagesSquare, key: "share" },
  { icon: Users, key: "meet" },
  { icon: ShieldCheck, key: "safe" },
] as const;

// Rejoindre la communauté du fort (inscription) ou se reconnecter
const JoinPage = () => {
  const { t } = useTranslation();
  const { signIn, isMember } = useMember();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode") === "connexion" ? "login" : "register";
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (isMember) return <Navigate to="/communaute" replace />;

  const switchMode = (next: "login" | "register") => {
    setError(null);
    setParams(next === "login" ? { mode: "connexion" } : {}, { replace: true });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setSending(true);
    setError(null);
    try {
      const session =
        mode === "login"
          ? await apiSend<MemberSession>("/community/login", "POST", { email: data.email, password: data.password })
          : await apiSend<MemberSession>("/community/register", "POST", {
              displayName: data.displayName,
              email: data.email,
              password: data.password,
              profile: data.profile,
              acceptCharter: data.acceptCharter === "on",
            });
      signIn(session.token, session.member);
      navigate("/communaute");
    } catch (err) {
      setError(err instanceof ApiError && err.message.length < 200 ? err.message : t("community.error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <Page>
      <Container className="grid items-start gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_28rem]">
        <div className="lg:pt-6">
          <Eyebrow>{t("community.eyebrow")}</Eyebrow>
          <h1 className="mt-4 font-display text-5xl font-medium leading-[1.04] tracking-tight text-balance text-ink sm:text-6xl">
            {t("community.joinTitle")}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{t("community.joinLead")}</p>
          <ul className="mt-10 space-y-6">
            {PERKS.map(({ icon: Icon, key }) => (
              <li key={key} className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-xl text-ink">{t(`community.perks.${key}.title`)}</p>
                  <p className="mt-1 text-ink-soft">{t(`community.perks.${key}.desc`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-line bg-card p-6 shadow-xl sm:p-8">
          <div className="grid grid-cols-2 rounded-full bg-paper-2 p-1" role="tablist" aria-label={t("community.joinTitle")}>
            {(["register", "login"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => switchMode(value)}
                className={cn(
                  "rounded-full py-2.5 text-sm font-semibold transition",
                  mode === value ? "bg-card text-ink shadow-soft" : "text-ink-soft hover:text-ink"
                )}
              >
                {value === "register" ? t("community.register") : t("community.login")}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-accent/40 bg-accent-soft p-3 text-sm" role="alert">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              {error}
            </div>
          )}

          <form key={mode} onSubmit={submit} className="mt-6 space-y-5">
            {mode === "register" && (
              <>
                <TextInput
                  id="displayName"
                  name="displayName"
                  label={t("community.displayName")}
                  hint={t("community.displayNameHint")}
                  autoComplete="nickname"
                  minLength={2}
                  maxLength={60}
                  required
                />
                <SelectInput id="profile" name="profile" label={t("community.youAre")} defaultValue="passionne">
                  {MEMBER_PROFILES.map((value) => (
                    <option key={value} value={value}>
                      {t(`community.profiles.${value}`)}
                    </option>
                  ))}
                </SelectInput>
              </>
            )}
            <TextInput id="email" name="email" type="email" label={t("login.email")} autoComplete="email" required />
            <TextInput
              id="password"
              name="password"
              type="password"
              label={t("login.password")}
              hint={mode === "register" ? t("community.passwordHint") : undefined}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              minLength={mode === "register" ? 8 : undefined}
              required
            />
            {mode === "register" && (
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4 text-sm transition hover:border-ink/30">
                <input type="checkbox" name="acceptCharter" required className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--accent)]" />
                <span className="text-ink">{t("community.acceptCharter")}</span>
              </label>
            )}
            <Button type="submit" disabled={sending} className="w-full py-3">
              {mode === "register" ? <UserPlus className="h-4 w-4" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
              {mode === "register" ? t("community.createAccount") : t("community.login")}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-soft">
            {t("community.teamLogin")}{" "}
            <Link to="/connexion" className="font-semibold text-ink hover:text-accent">
              {t("nav.login")}
            </Link>
          </p>
        </div>
      </Container>
    </Page>
  );
};

export default JoinPage;
