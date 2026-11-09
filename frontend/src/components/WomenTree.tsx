import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { PersonSummary } from "../types/Person";
import { formatFuzzyDate } from "../utils/localize";

// L'arbre pousse de bas en haut : une branche par période d'arrivée, une pomme par femme.
// Une fiche réservée est une pomme vide (pointillés) : la présence est dite, le reste est tu.

interface Group {
  key: string;
  label: string;
  persons: PersonSummary[];
}

const WIDTH = 820;
const TRUNK_X = WIDTH / 2;
const APPLE_R = 16;
const APPLE_GAP = 42;
const PER_ROW = 6;
const ROW_H = 46;
const MIN_BRANCH = 230;

const groupPersons = (persons: PersonSummary[], lang: string, unknownLabel: string): Group[] => {
  const locale = lang.startsWith("en") ? "en-GB" : "fr-FR";
  const groups = new Map<string, Group>();

  for (const person of persons) {
    const arrival = person.arrivalAtFort;
    let key = "zz-unknown";
    let label = unknownLabel;

    if (arrival?.date && arrival.precision && !["inconnue", "vers"].includes(arrival.precision)) {
      const date = new Date(arrival.date);
      const year = date.getUTCFullYear();
      if (arrival.precision === "annee") {
        key = `${year}`;
        label = `${year}`;
      } else {
        key = `${year}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
        label = date.toLocaleDateString(locale, { month: "long", year: "numeric", timeZone: "UTC" });
      }
    }

    const group = groups.get(key) ?? { key, label, persons: [] };
    group.persons.push(person);
    groups.set(key, group);
  }

  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
};

const grow = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.1, delay, ease: "easeInOut" }, opacity: { duration: 0.2, delay } },
  }),
};

const WomenTree = ({ persons }: { persons: PersonSummary[] }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [active, setActive] = useState<PersonSummary | null>(null);
  const groups = groupPersons(persons, i18n.language, t("home.unknownPeriod"));

  if (persons.length === 0) {
    return <p className="py-10 text-center text-ink-soft">{t("home.treeEmpty")}</p>;
  }

  // Mise en page de bas en haut : la première arrivée est la branche la plus basse
  const blocks = groups.map((group, index) => {
    const rows = Math.ceil(group.persons.length / PER_ROW);
    return { group, index, rows, height: 70 + rows * ROW_H, side: index % 2 === 0 ? -1 : 1 };
  });
  const height = blocks.reduce((sum, block) => sum + block.height, 0) + 150;
  let cursor = height - 80;
  const placed = blocks.map((block) => {
    cursor -= block.height;
    return { ...block, y: cursor };
  });
  const top = (placed[placed.length - 1]?.y ?? 60) - 40;
  const ground = height - 28;

  return (
    <div>
      <motion.svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="mx-auto w-full max-w-3xl overflow-visible"
        role="group"
        aria-label={t("home.treeTitle")}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {/* Sol et racines */}
        <motion.path
          d={`M ${TRUNK_X - 220} ${ground} Q ${TRUNK_X} ${ground - 10} ${TRUNK_X + 220} ${ground}`}
          className="stroke-line"
          strokeWidth={2}
          fill="none"
          variants={grow}
          custom={0}
          aria-hidden="true"
        />
        {[-1, 1].map((side) => (
          <motion.path
            key={side}
            d={`M ${TRUNK_X} ${ground - 18} q ${side * 30} 4 ${side * 70} 16`}
            className="stroke-ink-soft"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
            variants={grow}
            custom={0.1}
            aria-hidden="true"
          />
        ))}

        {/* Tronc */}
        <motion.path
          d={`M ${TRUNK_X} ${ground - 14} C ${TRUNK_X - 16} ${ground - (ground - top) * 0.35}, ${TRUNK_X + 16} ${
            ground - (ground - top) * 0.7
          }, ${TRUNK_X} ${top}`}
          className="stroke-ink-soft"
          strokeWidth={14}
          strokeLinecap="round"
          fill="none"
          variants={grow}
          custom={0.1}
          aria-hidden="true"
        />

        {placed.map(({ group, index, side, y }) => {
          const columns = Math.min(group.persons.length, PER_ROW);
          const length = Math.max(MIN_BRANCH, 90 + columns * APPLE_GAP);
          const endX = TRUNK_X + side * length;
          const delay = 0.5 + index * 0.25;

          return (
            <g key={group.key}>
              {/* Branche */}
              <motion.path
                d={`M ${TRUNK_X} ${y + 18} C ${TRUNK_X + side * 50} ${y + 6}, ${endX - side * 60} ${y - 6}, ${endX} ${y - 10}`}
                className="stroke-ink-soft"
                strokeWidth={4}
                strokeLinecap="round"
                fill="none"
                variants={grow}
                custom={delay}
                aria-hidden="true"
              />
              {/* Feuillage décoratif */}
              {Array.from({ length: Math.floor(length / 70) }, (_, leaf) => {
                const lx = TRUNK_X + side * (45 + leaf * 70);
                const ly = y + 4 - (leaf * 70 * 16) / length;
                return (
                  <motion.ellipse
                    key={leaf}
                    cx={lx}
                    cy={ly - 8}
                    rx={12}
                    ry={5}
                    className="fill-leaf"
                    transform={`rotate(${side * (leaf % 2 ? 28 : -22)} ${lx} ${ly - 8})`}
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 0.55, transition: { delay: delay + 0.6 } } }}
                    aria-hidden="true"
                  />
                );
              })}
              {/* Période, au bout de la branche */}
              <motion.text
                x={endX + side * 12}
                y={y - 4}
                textAnchor={side < 0 ? "end" : "start"}
                className="fill-ink font-display"
                fontSize={20}
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: delay + 0.3 } } }}
              >
                {group.label}
              </motion.text>

              {/* Pommes */}
              {group.persons.map((person, i) => {
                const column = i % PER_ROW;
                const row = Math.floor(i / PER_ROW);
                const cx = TRUNK_X + side * (70 + column * APPLE_GAP + APPLE_R);
                const cy = y + 46 + row * ROW_H;
                const reserved = person.publication?.visibility === "reservee";
                const isActive = active?._id === person._id;
                const open = () => navigate(`/personnes/${person._id}`);

                return (
                  <motion.g
                    key={person._id}
                    role="link"
                    tabIndex={0}
                    aria-label={reserved ? `${person.displayName} – ${t("tree.reserved")}` : person.displayName}
                    className="cursor-pointer outline-none"
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                    variants={{
                      hidden: { scale: 0, opacity: 0 },
                      visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { type: "spring", stiffness: 260, damping: 16, delay: delay + 0.5 + i * 0.05 },
                      },
                    }}
                    whileHover={{ scale: 1.18 }}
                    onMouseEnter={() => setActive(person)}
                    onFocus={() => setActive(person)}
                    onClick={open}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        open();
                      }
                    }}
                  >
                    <line
                      x1={cx}
                      y1={y + 12 - ((Math.abs(cx - TRUNK_X) * 24) / length)}
                      x2={cx}
                      y2={cy - APPLE_R}
                      className="stroke-ink-soft"
                      strokeWidth={1.2}
                    />
                    {isActive && <circle cx={cx} cy={cy} r={APPLE_R + 6} className="fill-none stroke-gold" strokeWidth={2.5} />}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={APPLE_R}
                      className={reserved ? "fill-card stroke-accent" : "fill-accent stroke-accent"}
                      strokeWidth={2}
                      strokeDasharray={reserved ? "4 3" : undefined}
                    />
                    {!reserved && <circle cx={cx - 4} cy={cy - 4} r={3.5} className="fill-white/35" />}
                    <path d={`M ${cx} ${cy - APPLE_R} q 4 -6 9 -5`} className="fill-none stroke-leaf" strokeWidth={2} strokeLinecap="round" />
                  </motion.g>
                );
              })}
            </g>
          );
        })}
      </motion.svg>

      {/* Carte d'information sur la pomme survolée ou sélectionnée */}
      <div className="mx-auto mt-6 min-h-24 max-w-md" aria-live="polite">
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-card p-5 shadow-lg"
            >
              <div>
                <p className="font-display text-2xl text-ink">{active.displayName}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {active.publication?.visibility === "reservee"
                    ? t("tree.reserved")
                    : t("tree.arrival", { date: formatFuzzyDate(active.arrivalAtFort, i18n.language) })}
                </p>
              </div>
              <Link
                to={`/personnes/${active._id}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent"
              >
                {t("home.treeOpen")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </motion.div>
          ) : (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-6 text-center text-ink-soft">
              {t("home.treeHint")}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WomenTree;
