import { CircleAlert, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { apiSend } from "../api/client";
import { TextInput } from "../components/FormField";
import LogoMark from "../components/LogoMark";
import { Button, Page } from "../components/ui";
import { useAuth, UserRole } from "../context/Auth/AuthContext";

interface LoginResponse {
  token: string;
  name: string;
  role: UserRole;
}

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSending(true);
    setError(false);

    try {
      const result = await apiSend<LoginResponse>("/user/login", "POST", {
        email: data.get("email"),
        password: data.get("password"),
      });
      login(result.name, result.token, result.role);
      navigate("/admin");
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <Page>
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-line bg-card p-8 shadow-xl sm:p-10">
          <LogoMark variant="horizontal" className="mx-auto w-full max-w-xs" alt={t("site.title")} />
          <h1 className="mt-6 font-display text-3xl text-ink">{t("login.title")}</h1>
          <p className="mt-2 text-ink-soft">{t("login.lead")}</p>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-accent/40 bg-accent-soft p-3 text-sm" role="alert">
              <CircleAlert className="h-4 w-4 text-accent" aria-hidden="true" />
              {t("login.error")}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-5">
            <TextInput id="email" name="email" type="email" label={t("login.email")} autoComplete="username" required />
            <TextInput
              id="password"
              name="password"
              type="password"
              label={t("login.password")}
              autoComplete="current-password"
              required
            />
            <Button type="submit" disabled={sending} className="w-full py-3">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {t("login.submit")}
            </Button>
          </form>
        </div>
      </div>
    </Page>
  );
};

export default LoginPage;
