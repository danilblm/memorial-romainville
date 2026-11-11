import { LogIn, LogOut, Menu, Settings, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth/AuthContext";
import { cn } from "../utils/cn";
import AccessibilityPanel from "./AccessibilityPanel";
import Dialog from "./Dialog";
import LanguageSwitcher from "./LanguageSwitcher";
import LogoMark from "./LogoMark";

const LINKS = [
  { to: "/", key: "nav.home", end: true },
  { to: "/carte", key: "nav.map" },
  { to: "/contribuer", key: "nav.contribute" },
  { to: "/nos-sources", key: "nav.sources" },
];

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    "relative px-3 py-2 text-sm font-medium transition-colors",
    "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-accent after:transition-transform after:duration-300",
    isActive ? "text-ink after:scale-x-100" : "text-ink-soft hover:text-ink after:scale-x-0 hover:after:scale-x-100"
  );

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 text-ink">
          <LogoMark className="h-8 w-8" />
          <span className="leading-none">
            <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent sm:block">
              {t("site.kicker")}
            </span>
            <span className="block whitespace-nowrap font-display text-base sm:text-lg">{t("site.short")}</span>
          </span>
        </Link>

        <nav aria-label={t("nav.mainNav")} className="ml-6 hidden items-center lg:flex">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={desktopLink}>
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:block">
            <LanguageSwitcher />
          </span>
          <AccessibilityPanel />

          {isAuthenticated ? (
            <div className="hidden items-center gap-1 lg:flex">
              <NavLink to="/admin" className={desktopLink}>
                <span className="inline-flex items-center gap-1.5">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  {t("nav.admin")}
                </span>
              </NavLink>
              <button
                type="button"
                onClick={signOut}
                title={t("nav.logout")}
                aria-label={t("nav.logout")}
                className="rounded-full p-2 text-ink-soft hover:bg-ink/5 hover:text-ink"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <Link
              to="/connexion"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink-soft hover:text-ink lg:inline-flex"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {t("nav.login")}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("nav.menu")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} labelledBy="mobile-menu-title" side>
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between">
            <p id="mobile-menu-title" className="font-display text-2xl">
              {t("site.short")}
            </p>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label={t("nav.close")} className="rounded-full p-2 hover:bg-ink/5">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <nav aria-label={t("nav.mainNav")} className="mt-8 flex flex-col">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn("border-b border-line py-4 font-display text-2xl", isActive ? "text-accent" : "text-ink")
                }
              >
                {t(link.key)}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="border-b border-line py-4 text-lg">
                  {t("nav.admin")}
                </NavLink>
                <button type="button" onClick={signOut} className="py-4 text-left text-lg text-ink-soft">
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <NavLink to="/connexion" onClick={() => setMenuOpen(false)} className="py-4 text-lg text-ink-soft">
                {t("nav.login")}
              </NavLink>
            )}
          </nav>
          <LanguageSwitcher className="mt-auto self-start" />
        </div>
      </Dialog>
    </header>
  );
};

export default Navbar;
