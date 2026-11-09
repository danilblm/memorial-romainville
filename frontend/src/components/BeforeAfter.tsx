import { ChevronsLeftRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Side {
  url: string;
  caption?: string;
  dateLabel?: string;
}

// Comparaison « hier et aujourd'hui » : glisser le curseur (souris, doigt ou flèches du clavier)
const BeforeAfter = ({ before, after }: { before: Side; after: Side }) => {
  const { t } = useTranslation();
  const [position, setPosition] = useState(50);

  return (
    <figure>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-night select-none">
        <img src={after.url} alt={after.caption ?? ""} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <img
          src={before.url}
          alt={before.caption ?? ""}
          className="absolute inset-0 h-full w-full object-cover sepia-[.25]"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          draggable={false}
        />

        {/* Séparateur */}
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90" style={{ left: `${position}%` }} aria-hidden="true">
          <span className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-night shadow-lg">
            <ChevronsLeftRight className="h-5 w-5" />
          </span>
        </div>

        {/* Étiquettes */}
        <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-night/80 px-3 py-1 text-xs font-semibold text-on-night">
          {t("place.then")}
          {before.dateLabel && ` · ${before.dateLabel}`}
        </span>
        <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-night/80 px-3 py-1 text-xs font-semibold text-on-night">
          {t("place.now")}
          {after.dateLabel && ` · ${after.dateLabel}`}
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label={t("place.compare")}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="mt-2 text-sm text-ink-soft">{t("place.compare")}</figcaption>
    </figure>
  );
};

export default BeforeAfter;
