import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import LogoMark from "./LogoMark";
import { Container } from "./ui";

const Footer = () => {
  const { t } = useTranslation();

  const links = [
    { to: "/carte", key: "nav.map" },
    { to: "/archives", key: "nav.archives" },
    { to: "/communaute", key: "nav.community" },
    { to: "/contribuer", key: "nav.contribute" },
    { to: "/nos-sources", key: "nav.sources" },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-paper-2 text-ink">
      <Container className="grid gap-10 py-16 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="h-10 w-10 text-ink" />
            <p className="font-display text-xl">{t("site.title")}</p>
          </div>
          <p className="mt-6 max-w-md font-display text-3xl italic leading-snug text-accent">{t("footer.slogan")}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">{t("footer.explore")}</p>
          <ul className="mt-4 space-y-2">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-ink transition hover:text-accent">
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">{t("footer.about")}</p>
          <p className="mt-4 text-ink">{t("footer.project")}</p>
          <p className="mt-2 text-sm text-ink-soft">{t("footer.team")}</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
