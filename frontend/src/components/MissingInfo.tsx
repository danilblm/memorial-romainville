import { CircleDashed } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LocalizedText } from "../types/common";
import { localize } from "../utils/localize";

// La mémoire est incomplète : on montre ce qui manque au lieu de le cacher
const MissingInfo = ({ items, title }: { items?: (LocalizedText | string)[]; title?: string }) => {
  const { t, i18n } = useTranslation();
  const texts = (items ?? [])
    .map((item) => (typeof item === "string" ? item : localize(item, i18n.language)))
    .filter(Boolean);

  if (texts.length === 0) return null;

  return (
    <section className="rounded-2xl border-2 border-dashed border-line bg-paper-2/40 p-6">
      <h2 className="flex items-center gap-2 font-display text-xl text-ink">
        <CircleDashed className="h-5 w-5 text-ink-soft" aria-hidden="true" />
        {title ?? t("missing.title")}
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-6 text-ink-soft marker:text-line">
        {texts.map((text, index) => (
          <li key={index}>{text}</li>
        ))}
      </ul>
    </section>
  );
};

export default MissingInfo;
