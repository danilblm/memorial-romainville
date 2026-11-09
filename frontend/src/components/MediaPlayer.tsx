import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TestimonyMedium } from "../types/Testimony";
import { mediaUrl } from "../utils/mediaUrl";

interface MediaPlayerProps {
  medium: TestimonyMedium;
  url?: string;
  transcript?: string;
}

// Lecteur audio/vidéo natif (lecture, pause, reprise au clavier) + transcription
const MediaPlayer = ({ medium, url, transcript }: MediaPlayerProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {url && medium === "audio" && (
        <div className="rounded-2xl border border-line bg-card p-4">
          <audio controls preload="none" src={mediaUrl(url)} className="w-full" />
        </div>
      )}
      {url && medium === "video" && (
        <video controls preload="none" src={mediaUrl(url)} className="w-full rounded-2xl bg-night" />
      )}

      {transcript &&
        (medium === "ecrit" ? (
          <blockquote className="relative rounded-2xl border border-line bg-card p-8 sm:p-10">
            <span className="absolute -top-6 left-6 font-display text-8xl leading-none text-accent/25" aria-hidden="true">
              “
            </span>
            <p className="relative whitespace-pre-line font-display text-xl leading-relaxed text-ink">{transcript}</p>
          </blockquote>
        ) : (
          <details className="group rounded-2xl border border-line bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-semibold">
              {t("testimony.transcript")}
              <ChevronDown className="h-5 w-5 transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="whitespace-pre-line border-t border-line p-5 leading-relaxed text-ink-soft">{transcript}</p>
          </details>
        ))}
    </div>
  );
};

export default MediaPlayer;
