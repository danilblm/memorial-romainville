import { motion } from "framer-motion";
import { ArrowRight, BookOpenCheck, CircleDashed, EyeOff, FileSearch, HandHeart, History, Map as MapIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import PageState from "../components/PageState";
import Reveal from "../components/Reveal";
import { ButtonLink, Container, Page, SectionHeading, Tag } from "../components/ui";
import WomenTree from "../components/WomenTree";
import { useApi } from "../hooks/useApi";
import { EventSummary } from "../types/Event";
import { PersonSummary } from "../types/Person";
import { PlaceSummary } from "../types/Place";

// Silhouette du fort qui se dessine dans le bandeau d'accueil
const FortOutline = () => (
  <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
    <motion.polygon
      points="200,30 370,150 310,360 90,360 30,150"
      fill="none"
      className="stroke-gold"
      strokeWidth={1.5}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2.4, ease: "easeInOut" }}
    />
    <motion.polygon
      points="200,80 320,165 278,320 122,320 80,165"
      fill="none"
      className="stroke-on-night-soft"
      strokeWidth={1}
      strokeDasharray="4 6"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2.4, delay: 0.4, ease: "easeInOut" }}
    />
    <motion.circle
      cx={200}
      cy={215}
      r={26}
      className="fill-accent"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", delay: 1.6, stiffness: 120 }}
      style={{ transformOrigin: "200px 215px" }}
    />
    <motion.path
      d="M200 189 q8 -16 22 -14"
      fill="none"
      className="stroke-leaf"
      strokeWidth={4}
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.6, delay: 2 }}
    />
  </svg>
);

const HomePage = () => {
  const { t } = useTranslation();
  const { data: persons, loading, error } = useApi<PersonSummary[]>("/persons");
  const { data: places } = useApi<PlaceSummary[]>("/places");
  const { data: events } = useApi<EventSummary[]>("/events");

  const stats = [
    { value: persons?.length, label: t("home.statWomen") },
    { value: places?.length, label: t("home.statPlaces") },
    { value: events?.length, label: t("home.statEvents") },
    { value: "1940–44", label: t("home.statPeriod") },
  ];

  const principles = [
    { icon: FileSearch, key: "source" },
    { icon: CircleDashed, key: "unknown" },
    { icon: EyeOff, key: "silence" },
  ];

  const explore = [
    { to: "/frise", icon: History, key: "timeline", className: "md:col-span-2" },
    { to: "/carte", icon: MapIcon, key: "map", className: "" },
    { to: "/contribuer", icon: HandHeart, key: "contribute", className: "" },
    { to: "/nos-sources", icon: BookOpenCheck, key: "sources", className: "md:col-span-2" },
  ];

  return (
    <Page>
      {/* Bandeau d'accueil */}
      <section className="grain relative overflow-hidden bg-night text-on-night">
        <div
          className="pointer-events-none absolute -top-40 -right-40 h-[36rem] w-[36rem] rounded-full bg-accent/25 blur-3xl"
          aria-hidden="true"
        />
        <Container className="relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xs font-semibold uppercase tracking-[0.25em] text-gold"
            >
              {t("home.eyebrow")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-5 font-display text-5xl leading-[1.02] font-medium sm:text-6xl lg:text-7xl"
            >
              {t("home.title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-7 max-w-xl text-lg leading-relaxed text-on-night-soft"
            >
              {t("home.lead")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-6 font-display text-2xl italic text-gold"
            >
              « {t("home.slogan")} »
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <a
                href="#arbre"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink shadow-lg shadow-accent/30 transition hover:brightness-110"
              >
                {t("home.ctaTree")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <ButtonLink to="/carte" variant="light" className="px-6 py-3">
                {t("home.ctaMap")}
              </ButtonLink>
            </motion.div>
          </div>
          <div className="mx-auto hidden aspect-square w-full max-w-sm lg:block">
            <FortOutline />
          </div>
        </Container>

        {/* Chiffres */}
        <div className="relative border-t border-on-night/10">
          <Container className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <p className="font-display text-4xl text-on-night">{stat.value ?? "—"}</p>
                <p className="mt-1 text-sm text-on-night-soft">{stat.label}</p>
              </motion.div>
            ))}
          </Container>
        </div>
      </section>

      {/* Arbre */}
      <section id="arbre" aria-labelledby="tree-title" className="scroll-mt-20 py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              id="tree-title"
              eyebrow={t("home.treeEyebrow")}
              title={t("home.treeTitle")}
              lead={t("home.treeHelp")}
              className="mx-auto text-center"
            />
          </Reveal>
          <div className="mt-12">
            <PageState loading={loading} error={error} />
            {persons && <WomenTree persons={persons} />}
          </div>

          {/* Même contenu en liste, pour le clavier et les lecteurs d'écran */}
          {persons && persons.length > 0 && (
            <Reveal className="mt-14">
              <h3 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
                {t("home.listTitle")}
              </h3>
              <ul className="mt-4 flex flex-wrap justify-center gap-2">
                {persons.map((person) => (
                  <li key={person._id}>
                    <Tag to={`/personnes/${person._id}`}>{person.displayName}</Tag>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </Container>
      </section>

      {/* Démarche */}
      <section aria-labelledby="principles-title" className="border-y border-line bg-paper-2/60 py-20 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading id="principles-title" eyebrow={t("home.principlesEyebrow")} title={t("home.principlesTitle")} />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {principles.map(({ icon: Icon, key }, index) => (
              <Reveal key={key} delay={index * 0.1}>
                <div className="h-full rounded-2xl border border-line bg-card p-7">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-2xl text-ink">{t(`home.principles.${key}.title`)}</h3>
                  <p className="mt-3 leading-relaxed text-ink-soft">{t(`home.principles.${key}.desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Explorer */}
      <section aria-labelledby="explore-title" className="py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading id="explore-title" eyebrow={t("home.exploreEyebrow")} title={t("home.exploreTitle")} />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {explore.map(({ to, icon: Icon, key, className }, index) => (
              <Reveal key={key} delay={index * 0.08} className={className}>
                <Link
                  to={to}
                  className="group relative flex h-full min-h-52 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-card p-7 transition duration-300 hover:-translate-y-1 hover:border-ink/30 hover:shadow-xl"
                >
                  <span
                    className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-accent/10 transition-transform duration-500 group-hover:scale-150"
                    aria-hidden="true"
                  />
                  <Icon className="relative h-8 w-8 text-accent" aria-hidden="true" />
                  <div className="relative">
                    <h3 className="font-display text-2xl text-ink">{t(`home.explore.${key}.title`)}</h3>
                    <p className="mt-2 max-w-md text-ink-soft">{t(`home.explore.${key}.desc`)}</p>
                    <ArrowRight
                      className="mt-4 h-5 w-5 text-ink transition-transform duration-300 group-hover:translate-x-2"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </Page>
  );
};

export default HomePage;
