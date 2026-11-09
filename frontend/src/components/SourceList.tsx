import { BookOpen, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Source } from "../types/Source";
import { localize } from "../utils/localize";

const SourceList = ({ sources }: { sources?: Source[] }) => {
  const { i18n } = useTranslation();

  if (!sources || sources.length === 0) return null;

  return (
    <ul className="space-y-3">
      {sources.map((source) => {
        const title = localize(source.title, i18n.language);
        const details = [source.holder, source.reference, source.author].filter(Boolean).join(" · ");

        return (
          <li key={source._id} className="flex gap-3">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" aria-hidden="true" />
            <div>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-accent"
                >
                  {title}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : (
                <p className="font-medium text-ink">{title}</p>
              )}
              {details && <p className="text-sm text-ink-soft">{details}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default SourceList;
