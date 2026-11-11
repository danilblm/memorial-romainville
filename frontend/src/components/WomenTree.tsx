import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { PersonSummary } from "../types/Person";
import { formatFuzzyDate } from "../utils/localize";

// L'arbre se lit comme le temps : le tronc monte de l'ouverture du camp (1940) à la Libération (1944).
// Une branche par année d'arrivée au fort, une pomme par femme. Les années sans fiche restent visibles :
// la mémoire est incomplète, et l'arbre le montre.

type AppleKind = "valid" | "pending" | "reserved";

interface Branch {
  key: string;
  label: string;
  persons: PersonSummary[];
}

const WIDTH = 1000;
const TRUNK_X = WIDTH / 2;
const APPLE_R = 17;
const APPLE_GAP = 80;
const PER_ROW = 4;
const ROW_H = 120;
const FIRST_YEAR = 1940;
const LAST_YEAR = 1944;

const appleKind = (person: PersonSummary): AppleKind => {
  if (person.status && person.status !== "valide") return "pending";
  return person.publication?.visibility === "reservee" ? "reserved" : "valid";
};

const surname = (name: string) => name.trim().split(/\s+/).pop() ?? name;

const yearOf = (person: PersonSummary): number | null => {
  const arrival = person.arrivalAtFort;
  if (!arrival?.date || arrival.precision === "inconnue") return null;
  return new Date(arrival.date).getUTCFullYear();
};

const buildBranches = (persons: PersonSummary[], unknownLabel: string): Branch[] => {
  const years = persons.map(yearOf).filter((year): year is number => year !== null);
  const from = Math.min(FIRST_YEAR, ...years);
  const to = Math.max(LAST_YEAR, ...years);
  const byDate = [...persons].sort((a, b) => (a.arrivalAtFort?.date ?? "").localeCompare(b.arrivalAtFort?.date ?? ""));

  const branches: Branch[] = [];
  for (let year = from; year <= to; year++) {
    branches.push({ key: `${year}`, label: `${year}`, persons: byDate.filter((person) => yearOf(person) === year) });
  }
  const unknown = byDate.filter((person) => yearOf(person) === null);
  if (unknown.length > 0) branches.push({ key: "unknown", label: unknownLabel, persons: unknown });
  return branches;
};

const grow = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.1, delay, ease: "easeInOut" }, opacity: { duration: 0.2, delay } },
  }),
};

// Une pomme, dans l'un des trois états d'une fiche
const Apple = ({ kind, cx, cy, r = APPLE_R }: { kind: AppleKind; cx: number; cy: number; r?: number }) => (
  <>
    <circle
      cx={cx}
      cy={cy}
      r={r}
      className={kind === "valid" ? "fill-accent stroke-accent" : kind === "pending" ? "stroke-accent" : "fill-card stroke-accent"}
      fill={kind === "pending" ? "url(#tree-hatch)" : undefined}
      strokeWidth={2}
      strokeDasharray={kind === "reserved" ? "4 3" : undefined}
    />
    {kind === "valid" && <circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.2} className="fill-white/35" />}
    <path d={`M ${cx} ${cy - r} q 4 -6 9 -5`} className="fill-none stroke-leaf" strokeWidth={2} strokeLinecap="round" />
  </>
);

const LegendApple = ({ kind }: { kind: AppleKind }) => (
  <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0 overflow-visible" aria-hidden="true">
    <Apple kind={kind} cx={20} cy={22} r={13} />
  </svg>
);

const WomenTree = ({ persons }: { persons: PersonSummary[] }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [active, setActive] = useState<PersonSummary | null>(persons[0] ?? null);
  const branches = buildBranches(persons, t("home.unknownPeriod"));

  if (persons.length === 0) {
    return <p className="py-10 text-center text-ink-soft">{t("home.treeEmpty")}</p>;
  }

  // Mise en page de bas en haut : la première année est la branche la plus basse
  const blocks = branches.map((branch, index) => {
    const rows = Math.max(1, Math.ceil(branch.persons.length / PER_ROW));
    const height = branch.persons.length === 0 ? 74 : 60 + rows * ROW_H;
    return { branch, index, rows, height, side: index % 2 === 0 ? -1 : 1 };
  });
  const height = blocks.reduce((sum, block) => sum + block.height, 0) + 130;
  let cursor = height - 70;
  const placed = blocks.map((block) => {
    cursor -= block.height;
    return { ...block, y: cursor + (block.branch.persons.length === 0 ? 30 : 0) };
  });
  const top = (placed[placed.length - 1]?.y ?? 60) - 30;
  const ground = height - 24;

  const activeKind = active ? appleKind(active) : null;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_20rem]">
      <motion.svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="mx-auto w-full max-w-3xl overflow-visible"
        role="group"
        aria-label={t("home.treeTitle")}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <defs>
          <pattern id="tree-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" className="fill-accent-soft" />
            <line x1="0" y1="0" x2="0" y2="6" className="stroke-accent" strokeWidth="2.2" />
          </pattern>
        </defs>

        {/* Sol et racines */}
        <motion.path
          d={`M ${TRUNK_X - 240} ${ground} Q ${TRUNK_X} ${ground - 10} ${TRUNK_X + 240} ${ground}`}
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

        {/* Tronc : le temps qui passe */}
        <motion.path
          d={`M ${TRUNK_X} ${ground - 14} C ${TRUNK_X - 14} ${ground - (ground - top) * 0.35}, ${TRUNK_X + 14} ${
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

        {placed.map(({ branch, index, side, y }) => {
          const count = branch.persons.length;
          const empty = count === 0;
          const columns = Math.min(count, PER_ROW);
          const length = empty ? 150 : Math.max(240, 100 + columns * APPLE_GAP);
          const endX = TRUNK_X + side * length;
          const delay = 0.4 + index * 0.2;
          const labelX = endX + side * 14;

          return (
            <g key={branch.key}>
              {/* Branche */}
              <motion.path
                d={`M ${TRUNK_X} ${y + 18} C ${TRUNK_X + side * 50} ${y + 6}, ${endX - side * 60} ${y - 6}, ${endX} ${y - 10}`}
                className={empty ? "stroke-line" : "stroke-ink-soft"}
                strokeWidth={empty ? 3 : 4.5}
                strokeLinecap="round"
                fill="none"
                variants={grow}
                custom={delay}
                aria-hidden="true"
              />
              {/* Feuillage */}
              {!empty &&
                Array.from({ length: Math.floor(length / 70) }, (_, leaf) => {
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
                      variants={{ hidden: { opacity: 0 }, visible: { opacity: 0.6, transition: { delay: delay + 0.6 } } }}
                      aria-hidden="true"
                    />
                  );
                })}
              {/* Année, au bout de la branche */}
              <motion.g variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: delay + 0.3 } } }}>
                <text
                  x={labelX}
                  y={y - 4}
                  textAnchor={side < 0 ? "end" : "start"}
                  className={empty ? "fill-ink-soft font-display" : "fill-ink font-display"}
                  fontSize={empty ? 24 : 32}
                >
                  {branch.label}
                </text>
                <text
                  x={labelX}
                  y={y + 20}
                  textAnchor={side < 0 ? "end" : "start"}
                  className="fill-ink-soft"
                  fontSize={16}
                  fontStyle={empty ? "italic" : undefined}
                >
                  {empty ? t("tree.emptyYear") : t("tree.count", { count })}
                </text>
              </motion.g>

              {/* Pommes, en quinconce pour laisser la place aux noms */}
              {branch.persons.map((person, i) => {
                const column = i % PER_ROW;
                const row = Math.floor(i / PER_ROW);
                const cx = TRUNK_X + side * (80 + column * APPLE_GAP + APPLE_R);
                const cy = y + 48 + row * ROW_H + (column % 2) * 60;
                const kind = appleKind(person);
                const isActive = active?._id === person._id;
                const open = () => navigate(`/personnes/${person._id}`);

                return (
                  <motion.g
                    key={person._id}
                    role="link"
                    tabIndex={0}
                    aria-label={`${person.displayName} – ${t(`tree.kinds.${kind}`)}`}
                    className="cursor-pointer outline-none"
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                    variants={{
                      hidden: { scale: 0, opacity: 0 },
                      visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { type: "spring", stiffness: 260, damping: 16, delay: delay + 0.5 + i * 0.08 },
                      },
                    }}
                    whileHover={{ scale: 1.12 }}
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
                      y1={y + 12 - (Math.abs(cx - TRUNK_X) * 24) / length}
                      x2={cx}
                      y2={cy - APPLE_R}
                      className="stroke-ink-soft"
                      strokeWidth={1.2}
                    />
                    {isActive && <circle cx={cx} cy={cy} r={APPLE_R + 6} className="fill-none stroke-ink" strokeWidth={2.5} />}
                    <Apple kind={kind} cx={cx} cy={cy} />
                    <text
                      x={cx}
                      y={cy + APPLE_R + 21}
                      textAnchor="middle"
                      fontSize={16}
                      className={isActive ? "fill-ink font-semibold" : "fill-ink-soft"}
                    >
                      {surname(person.displayName)}
                    </text>
                  </motion.g>
                );
              })}
            </g>
          );
        })}

        {/* Repère du temps, au pied du tronc */}
        <text x={TRUNK_X} y={height - 2} textAnchor="middle" className="fill-ink-soft" fontSize={14} letterSpacing={2}>
          {t("tree.timeArrow").toUpperCase()}
        </text>
      </motion.svg>

      <div className="space-y-6 lg:sticky lg:top-28">
        {/* Fiche de la pomme survolée */}
        <div aria-live="polite" className="min-h-40">
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-line bg-card p-6 shadow-soft"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{t(`tree.kinds.${activeKind}`)}</p>
                <p className="mt-2 font-display text-3xl leading-tight text-ink">{active.displayName}</p>
                <p className="mt-2 text-sm text-ink-soft">
                  {t("tree.arrival", { date: formatFuzzyDate(active.arrivalAtFort, i18n.language) })}
                </p>
                <Link
                  to={`/personnes/${active._id}`}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent"
                >
                  {t("home.treeOpen")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comment lire l'arbre */}
        <div className="rounded-2xl border border-line p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">{t("tree.howTo")}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("tree.howToText")}</p>
          <ul className="mt-5 space-y-4">
            {(["valid", "pending", "reserved"] as const).map((kind) => (
              <li key={kind} className="flex items-center gap-3">
                <LegendApple kind={kind} />
                <span className="text-sm leading-snug">
                  <span className="block font-semibold text-ink">{t(`tree.kinds.${kind}`)}</span>
                  <span className="text-ink-soft">{t(`tree.kindsHelp.${kind}`)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WomenTree;

