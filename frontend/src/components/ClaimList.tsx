import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Claim } from "../types/common";
import { localize } from "../utils/localize";
import ReliabilityBadge from "./ReliabilityBadge";

// Chaque affirmation s'affiche avec son niveau de fiabilité
const ClaimList = ({ claims }: { claims: Claim[] }) => {
  const { t, i18n } = useTranslation();

  if (claims.length === 0) return null;

  return (
    <ul className="divide-y divide-line">
      {claims.map((claim) => (
        <li key={claim._id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="border-l-2 border-accent/60 pl-4">
            <p className="text-ink">{localize(claim.value, i18n.language)}</p>
            {claim.note && <p className="mt-1 text-sm italic text-ink-soft">{claim.note}</p>}
          </div>
          <div className="flex flex-wrap gap-2 pl-4 sm:pl-0">
            <ReliabilityBadge level={claim.reliability} />
            {claim.aiAssisted && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-2.5 py-1 text-xs font-semibold text-ink-soft">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {t("common.aiAssisted")}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ClaimList;
