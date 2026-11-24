import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedNumber from "../components/AnimatedNumber";
import ExploreIndex from "../components/ExploreIndex";
import GraffitiTorch from "../components/GraffitiTorch";
import PageState from "../components/PageState";
import ReliabilityBadge from "../components/ReliabilityBadge";
import StoryScroll from "../components/StoryScroll";
import Reveal from "../components/Reveal";
import { ButtonLink, Container, Page, SectionHeading, Tag } from "../components/ui";
import WomenTree from "../components/WomenTree";
import { useApi } from "../hooks/useApi";
import { EventSummary } from "../types/Event";
import { PersonSummary } from "../types/Person";
import { PlaceSummary } from "../types/Place";

// Photographie de l'entrée du fort prise à la Libération (fonds partagé par le Mémorial national)
const HERO_IMAGE = "/images/entree-fort-liberation.jpg";

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

  return (
    <Page>
      {/* Bandeau d'accueil : fond blanc, photo d'archive en noir et blanc fondue à droite */}
      <section className="relative overflow-hidden bg-paper text-ink">
        <motion.img
          src={HERO_IMAGE}
          alt=""
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.9, scale: [1.08, 1, 1.1] }}
          transition={{
            opacity: { duration: 1.8, ease: "easeOut" },
            scale: { duration: 30, times: [0, 0.07, 1], ease: "linear", repeat: Infinity, repeatType: "reverse" },
          }}
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-full object-cover object-top grayscale [mask-image:linear-gradient(to_right,transparent,black_45%)] lg:w-[62%]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-paper via-paper/90 to-paper/10 lg:via-paper/70"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper to-transparent" aria-hidden="true" />

        <Container className="relative py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent before:h-px before:w-10 before:bg-accent/60"
            >
              {t("home.eyebrow")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="mt-6 font-display text-5xl leading-[0.98] font-medium tracking-tight text-balance sm:text-7xl lg:text-8xl"
            >
              {t("home.title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-8 max-w-xl text-lg leading-relaxed text-pretty text-ink-soft"
            >
              {t("home.lead")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-6 border-l-2 border-accent/60 pl-4 font-display text-2xl italic text-accent"
            >
              {t("home.slogan")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <a
                href="#arbre"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink shadow-soft transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
              >
                {t("home.ctaTree")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
              <ButtonLink to="/carte" variant="secondary" className="px-6 py-3">
                {t("home.ctaMap")}
              </ButtonLink>
            </motion.div>
          </div>
        </Container>

        <div className="relative mx-auto flex max-w-6xl items-end justify-between gap-6 px-4 pb-4 sm:px-6 lg:px-8">
          <a
            href="#histoire"
            className="group hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft hover:text-accent sm:inline-flex"
          >
            {t("home.scrollCue")}
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </motion.span>
          </a>
          <p className="text-right text-[0.7rem] text-ink-soft">{t("home.heroCredit")}</p>
        </div>

        {/* Chiffres */}
        <div className="relative border-t border-line bg-paper-2">
          <Container className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="border-l border-line pl-4"
              >
                <p className="font-display text-4xl text-accent">
                  {typeof stat.value === "number" ? <AnimatedNumber value={stat.value} /> : stat.value ?? "—"}
                </p>
                <p className="mt-1 text-sm text-ink-soft">{stat.label}</p>
              </motion.div>
            ))}
          </Container>
        </div>
      </section>

      <StoryScroll />

      {/* Arbre */}
      <section id="arbre" aria-labelledby="tree-title" className="scroll-mt-20 py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              id="tree-title"
              eyebrow={t("home.treeEyebrow")}
              title={t("home.treeTitle")}
              lead={t("home.treeHelp")}
              center
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

      <GraffitiTorch />

      {/* Démarche : on montre un extrait de fiche plutôt que de longs discours */}
      <section aria-labelledby="method-title" className="border-y border-line bg-paper-2 py-24 text-ink sm:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{t("home.method.eyebrow")}</p>
            <h2 id="method-title" className="mt-4 max-w-xl font-display text-4xl font-medium leading-[1.1] tracking-tight text-balance sm:text-5xl">
              {t("home.method.title")}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{t("home.method.p1")}</p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">{t("home.method.p2")}</p>
          </Reveal>

          <Reveal delay={0.15}>
            <figure className="rounded-2xl border border-line bg-card p-6 shadow-soft sm:p-7">
              <figcaption className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">{t("home.method.sample")}</figcaption>
              <dl className="mt-5 divide-y divide-line">
                {(
                  [
                    ["arrival", "recoupee"],
                    ["convoy", "documentee"],
                    ["birthplace", "inconnue"],
                  ] as const
                ).map(([key, level]) => (
                  <div key={key} className="flex items-start justify-between gap-4 py-3.5">
                    <div>
                      <dt className="text-sm text-ink-soft">{t(`home.method.rows.${key}.label`)}</dt>
                      <dd className="mt-0.5 font-medium text-ink">{t(`home.method.rows.${key}.value`)}</dd>
                    </div>
                    <ReliabilityBadge level={level} />
                  </div>
                ))}
              </dl>
              <div className="mt-4 rounded-xl border-2 border-dashed border-line p-4">
                <p className="text-sm font-semibold text-ink">{t("missing.title")}</p>
                <p className="mt-1 text-sm text-ink-soft">{t("home.method.missing")}</p>
              </div>
            </figure>
          </Reveal>
        </Container>
      </section>

      <ExploreIndex />
    </Page>
  );
};

export default HomePage;
