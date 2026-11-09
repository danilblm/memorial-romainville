import { Box, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PersonSummary } from "../types/Person";

// Arbre des femmes : un tronc, une branche par période d'arrivée, une pomme par femme.
// Une fiche réservée est une pomme vide (pointillés) : la présence est dite, le reste est tu.

interface Group {
  key: string;
  label: string;
  persons: PersonSummary[];
}

const APPLES_PER_ROW = 6;
const APPLE_GAP = 40;
const ROW_HEIGHT = 44;
const WIDTH = 760;
const TRUNK_X = WIDTH / 2;

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

const WomenTree = ({ persons }: { persons: PersonSummary[] }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const groups = groupPersons(persons, i18n.language, t("home.unknownPeriod"));

  // Hauteur de chaque branche selon le nombre de pommes
  let y = 60;
  const layout = groups.map((group, index) => {
    const rows = Math.ceil(group.persons.length / APPLES_PER_ROW);
    const top = y;
    y += 40 + rows * ROW_HEIGHT;
    return { group, top, side: index % 2 === 0 ? -1 : 1 };
  });
  const height = y + 40;

  const ink = theme.palette.text.primary;
  const quiet = theme.palette.text.secondary;
  const apple = theme.palette.secondary.main;

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} width="100%" role="img" aria-label={t("home.treeTitle")}>
        {/* Tronc */}
        <line x1={TRUNK_X} y1={20} x2={TRUNK_X} y2={height - 10} stroke={quiet} strokeWidth={6} strokeLinecap="round" />

        {layout.map(({ group, top, side }) => {
          const branchEnd = TRUNK_X + side * 330;
          return (
            <g key={group.key}>
              <line x1={TRUNK_X} y1={top + 20} x2={branchEnd} y2={top + 20} stroke={quiet} strokeWidth={3} />
              <text
                x={TRUNK_X + side * 16}
                y={top + 10}
                textAnchor={side < 0 ? "end" : "start"}
                fontSize={14}
                fontWeight={600}
                fill={ink}
              >
                {group.label}
              </text>

              {group.persons.map((person, index) => {
                const column = index % APPLES_PER_ROW;
                const row = Math.floor(index / APPLES_PER_ROW);
                const cx = TRUNK_X + side * (60 + column * APPLE_GAP);
                const cy = top + 44 + row * ROW_HEIGHT;
                const reserved = person.publication?.visibility === "reservee";
                const open = () => navigate(`/personnes/${person._id}`);

                return (
                  <g
                    key={person._id}
                    role="link"
                    tabIndex={0}
                    aria-label={person.displayName}
                    style={{ cursor: "pointer" }}
                    onClick={open}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        open();
                      }
                    }}
                  >
                    <title>{person.displayName}</title>
                    <line x1={cx} y1={top + 20} x2={cx} y2={cy - 14} stroke={quiet} strokeWidth={1} />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={14}
                      fill={reserved ? "none" : apple}
                      fillOpacity={reserved ? 1 : 0.85}
                      stroke={apple}
                      strokeWidth={2}
                      strokeDasharray={reserved ? "4 3" : undefined}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </Box>
  );
};

export default WomenTree;
