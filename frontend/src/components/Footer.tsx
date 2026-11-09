import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import LogoMark from "./LogoMark";
import { Container } from "./ui";

const Footer = () => {
  const { t } = useTranslation();

  const links = [
    { to: "/frise", key: "nav.timeline" },
    { to: "/carte", key: "nav.map" },
    { to: "/contribuer", key: "nav.contribute" },
    { to: "/nos-sources", key: "nav.sources" },
  ];

  return (
    <footer className="grain mt-24 bg-night text-on-night">
      <Container className="grid gap-10 py-16 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="h-10 w-10 text-on-night" />
            <p className="font-display text-xl">{t("site.title")}</p>
          </div>
          <p className="mt-6 max-w-md font-display text-3xl italic leading-snug text-gold">{t("footer.slogan")}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-night-soft">{t("footer.explore")}</p>
          <ul className="mt-4 space-y-2">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-on-night/90 transition hover:text-gold">
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-night-soft">{t("footer.about")}</p>
          <p className="mt-4 text-on-night/90">{t("footer.project")}</p>
          <p className="mt-2 text-sm text-on-night-soft">{t("footer.team")}</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
