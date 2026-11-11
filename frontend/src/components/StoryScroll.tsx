import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";
import { Container, SectionHeading } from "./ui";

// Récit au défilement : l'image de gauche reste fixe et change selon l'étape lue à droite.
// Photographies : fonds partagé par le Mémorial national (prises à la Libération, sauf mention).
const STEPS = [
  { key: "1", image: "/images/histoire/barbeles.jpg" },
  { key: "2", image: "/images/histoire/rangee-casemates.jpg" },
  { key: "3", image: "/images/histoire/plaques.jpg" },
  { key: "4", image: "/images/histoire/dortoir.jpg" },
  { key: "5", image: "/images/entree-fort-liberation.jpg" },
];

const StoryScroll = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const current = STEPS[active];

  return (
    <section id="histoire" aria-labelledby="story-title" className="scroll-mt-20 bg-paper py-24 sm:py-32">
      <Container>
        <SectionHeading id="story-title" eyebrow={t("story.eyebrow")} title={t("story.title")} lead={t("story.lead")} />

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* Image fixe (grand écran) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 h-[72vh] overflow-hidden rounded-3xl bg-night shadow-lift">
              <AnimatePresence>
                <motion.img
                  key={current.image}
                  src={current.image}
                  alt={t(`story.steps.${current.key}.alt`)}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-transparent" aria-hidden="true" />

              <div className="absolute inset-x-0 bottom-0 p-8 text-on-night">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={current.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4 }}
                    className="font-display text-6xl text-white"
                  >
                    {t(`story.steps.${current.key}.date`)}
                  </motion.p>
                </AnimatePresence>
                <p className="mt-3 text-xs text-on-night-soft">{t("story.credit")}</p>
              </div>

              {/* Progression */}
              <div className="absolute top-6 right-6 flex flex-col gap-2" aria-hidden="true">
                {STEPS.map((step, index) => (
                  <span
                    key={step.key}
                    className={cn(
                      "w-1 rounded-full transition-all duration-500",
                      index === active ? "h-10 bg-white" : index < active ? "h-4 bg-on-night/70" : "h-4 bg-on-night/25"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Étapes */}
          <ol>
            {STEPS.map((step, index) => (
              <motion.li
                key={step.key}
                onViewportEnter={() => setActive(index)}
                viewport={{ amount: 0.6 }}
                className="flex min-h-[72vh] flex-col justify-center py-10"
              >
                <img
                  src={step.image}
                  alt={t(`story.steps.${step.key}.alt`)}
                  loading="lazy"
                  className="mb-8 aspect-[4/3] w-full rounded-2xl object-cover shadow-soft lg:hidden"
                />
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="flex items-center gap-3 font-display text-2xl text-accent">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 font-sans text-sm font-semibold">
                      {index + 1}
                    </span>
                    {t(`story.steps.${step.key}.date`)}
                  </p>
                  <h3 className="mt-5 font-display text-4xl leading-tight tracking-tight text-balance text-ink sm:text-5xl">
                    {t(`story.steps.${step.key}.title`)}
                  </h3>
                  <p className="mt-6 text-lg leading-relaxed text-pretty text-ink-soft">{t(`story.steps.${step.key}.text`)}</p>
                </motion.div>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-8 text-sm">
          <Link to="/nos-sources" className="group inline-flex items-center gap-2 font-semibold text-accent">
            <span className="link-underline">{t("story.sources")}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default StoryScroll;
