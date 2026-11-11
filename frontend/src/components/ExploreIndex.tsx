import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";
import Reveal from "./Reveal";
import { Container, SectionHeading } from "./ui";

// Sommaire du site, à la manière d'un index de livre : une ligne par chemin,
// et à droite une photo d'archive qui change selon la ligne survolée.
const PATHS = [
  { to: "/carte", key: "map", image: "/images/histoire/rangee-casemates.jpg" },
  { to: "/contribuer", key: "contribute", image: "/images/histoire/carte-postale-entree.jpg" },
  { to: "/nos-sources", key: "sources", image: "/images/histoire/interieur-casemate.jpg" },
];

const ExploreIndex = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const current = PATHS[active];

  return (
    <section aria-labelledby="explore-title" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading id="explore-title" eyebrow={t("home.exploreEyebrow")} title={t("home.exploreTitle")} />
        </Reveal>

        <div className="mt-14 grid items-start gap-12 lg:grid-cols-[1fr_24rem]">
          <ol className="border-b border-line">
            {PATHS.map((path, index) => (
              <Reveal key={path.key} delay={index * 0.06}>
                <li className="border-t border-line">
                  <Link
                    to={path.to}
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 py-7 sm:grid-cols-[4rem_1fr_auto] sm:py-9"
                  >
                    <span
                      className={cn(
                        "font-display text-sm tracking-[0.2em] transition-colors",
                        index === active ? "text-accent" : "text-ink-soft"
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-3xl tracking-tight text-ink transition-transform duration-300 group-hover:translate-x-2 sm:text-5xl">
                        {t(`home.explore.${path.key}.title`)}
                      </span>
                      <span className="mt-2 block max-w-lg text-ink-soft">{t(`home.explore.${path.key}.desc`)}</span>
                    </span>
                    <span
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full border transition duration-300 sm:h-14 sm:w-14",
                        index === active
                          ? "border-accent bg-accent text-accent-ink"
                          : "border-line text-ink group-hover:border-accent group-hover:text-accent"
                      )}
                    >
                      <ArrowUpRight
                        className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ol>

          {/* Photo d'archive associée au chemin survolé */}
          <figure className="sticky top-28 hidden lg:block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-night">
              <AnimatePresence initial={false}>
                <motion.img
                  key={current.image}
                  src={current.image}
                  alt=""
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 h-full w-full object-cover grayscale"
                />
              </AnimatePresence>
            </div>
            <figcaption className="mt-3 text-sm text-ink-soft">{t(`home.explore.${current.key}.image`)}</figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
};

export default ExploreIndex;
