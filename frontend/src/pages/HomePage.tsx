import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  CircleDashed,
  EyeOff,
  FileSearch,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedNumber from "../components/AnimatedNumber";
import ExploreIndex from "../components/ExploreIndex";
import GraffitiTorch from "../components/GraffitiTorch";
import PageState from "../components/PageState";
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

  const principles = [
    { icon: FileSearch, key: "source" },
    { icon: CircleDashed, key: "unknown" },
    { icon: EyeOff, key: "silence" },
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

      {/* Démarche */}
      <section aria-labelledby="principles-title" className="relative overflow-hidden bg-paper-2 py-24 text-ink sm:py-28">
        <Container className="relative">
          <Reveal>
            <SectionHeading id="principles-title" eyebrow={t("home.principlesEyebrow")} title={t("home.principlesTitle")} />
          </Reveal>
          <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
            {principles.map(({ icon: Icon, key }, index) => (
              <Reveal key={key} delay={index * 0.1}>
                <div className="group h-full border-t border-line pt-6 transition duration-300 hover:border-accent">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm tracking-[0.2em] text-accent">{String(index + 1).padStart(2, "0")}</span>
                    <Icon className="h-5 w-5 text-ink-soft transition group-hover:text-accent" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl tracking-tight">{t(`home.principles.${key}.title`)}</h3>
                  <p className="mt-3 leading-relaxed text-ink-soft">{t(`home.principles.${key}.desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <ExploreIndex />
    </Page>
  );
};

export default HomePage;
