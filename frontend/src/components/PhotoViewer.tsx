import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from "lucide-react";
import { PointerEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../utils/cn";
import Dialog from "./Dialog";

export interface ViewerPhoto {
  url: string;
  caption?: string;
  meta?: string; // ex. « Archive · vers 1944 »
}

interface PhotoViewerProps {
  photos: ViewerPhoto[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const clamp = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

// Visionneuse plein écran : zoom (molette, boutons, double-clic), déplacement à la souris ou au doigt,
// flèches du clavier pour changer de photo, Échap pour fermer
const PhotoViewer = ({ photos, index, onIndexChange }: PhotoViewerProps) => {
  const { t } = useTranslation();
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const open = index !== null;
  const photo = index !== null ? photos[index] : undefined;
  const hasPrev = index !== null && index > 0;
  const hasNext = index !== null && index < photos.length - 1;

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Nouvelle photo : on repart sans zoom
  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [index]);

  const zoom = (delta: number) =>
    setScale((current) => {
      const next = clamp(current + delta);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });

  useEffect(() => {
    if (!open) return;
    const zoomBy = (delta: number) =>
      setScale((current) => {
        const next = clamp(current + delta);
        if (next === 1) setOffset({ x: 0, y: 0 });
        return next;
      });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && hasPrev) onIndexChange((index ?? 0) - 1);
      if (event.key === "ArrowRight" && hasNext) onIndexChange((index ?? 0) + 1);
      if (event.key === "+" || event.key === "=") zoomBy(0.5);
      if (event.key === "-") zoomBy(-0.5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, hasPrev, hasNext, onIndexChange]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (scale === 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y };
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.offsetX + event.clientX - dragStart.current.x,
      y: dragStart.current.offsetY + event.clientY - dragStart.current.y,
    });
  };

  const iconButton = "rounded-full p-2.5 text-on-night transition hover:bg-on-night/10 disabled:opacity-30";

  return (
    <Dialog open={open} onClose={() => onIndexChange(null)} labelledBy="viewer-title" fullscreen>
      {photo && (
        <div className="flex h-full flex-col">
          {/* Barre du haut */}
          <div className="flex items-center gap-2 border-b border-on-night/10 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p id="viewer-title" className="truncate font-display text-lg">
                {photo.caption || t("viewer.photo")}
              </p>
              <p className="text-xs text-on-night-soft">
                {t("viewer.counter", { n: (index ?? 0) + 1, total: photos.length })}
                {photo.meta && ` · ${photo.meta}`}
              </p>
            </div>
            <button type="button" className={iconButton} onClick={() => zoom(-0.5)} disabled={scale <= MIN_SCALE} aria-label={t("viewer.zoomOut")}>
              <Minus className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="w-12 text-center text-sm tabular-nums" aria-live="polite">
              {Math.round(scale * 100)} %
            </span>
            <button type="button" className={iconButton} onClick={() => zoom(0.5)} disabled={scale >= MAX_SCALE} aria-label={t("viewer.zoomIn")}>
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" className={iconButton} onClick={reset} disabled={scale === 1} aria-label={t("viewer.reset")}>
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" className={iconButton} onClick={() => onIndexChange(null)} aria-label={t("nav.close")}>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Image */}
          <div
            className={cn(
              "relative flex flex-1 touch-none items-center justify-center overflow-hidden select-none",
              scale > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
            )}
            onWheel={(event) => zoom(event.deltaY < 0 ? 0.25 : -0.25)}
            onDoubleClick={() => (scale > 1 ? reset() : setScale(2.5))}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
          >
            <img
              src={photo.url}
              alt={photo.caption ?? ""}
              draggable={false}
              className={cn("max-h-full max-w-full object-contain", !dragging && "transition-transform duration-200")}
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
            />

            {hasPrev && (
              <button
                type="button"
                onClick={() => onIndexChange((index ?? 0) - 1)}
                aria-label={t("viewer.previous")}
                className="absolute left-4 rounded-full bg-night/70 p-3 text-on-night hover:bg-night"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
            )}
            {hasNext && (
              <button
                type="button"
                onClick={() => onIndexChange((index ?? 0) + 1)}
                aria-label={t("viewer.next")}
                className="absolute right-4 rounded-full bg-night/70 p-3 text-on-night hover:bg-night"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            )}
          </div>

          <p className="px-4 py-3 text-center text-xs text-on-night-soft">{t("viewer.hint")}</p>
        </div>
      )}
    </Dialog>
  );
};

export default PhotoViewer;
