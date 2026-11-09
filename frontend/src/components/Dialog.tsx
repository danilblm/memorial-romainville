import { ReactNode, useEffect, useRef } from "react";
import { cn } from "../utils/cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  side?: boolean; // panneau latéral plutôt que fenêtre centrée
  fullscreen?: boolean; // plein écran (visionneuse de photos)
  className?: string;
}

// Fenêtre native <dialog> : focus piégé, touche Échap et lecteurs d'écran gérés par le navigateur
const Dialog = ({ open, onClose, labelledBy, children, side, fullscreen, className }: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        fullscreen
          ? "m-0 h-dvh max-h-none w-screen max-w-none bg-night text-on-night"
          : side
            ? "m-0 ml-auto h-dvh max-h-dvh w-full max-w-sm border-l border-line bg-card text-ink shadow-2xl"
            : "m-auto w-[min(92vw,40rem)] max-h-[88dvh] rounded-2xl border border-line bg-card text-ink shadow-2xl",
        className
      )}
    >
      {open && children}
    </dialog>
  );
};

export default Dialog;
