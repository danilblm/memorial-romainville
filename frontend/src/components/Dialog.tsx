import { ReactNode, useEffect, useRef } from "react";
import { cn } from "../utils/cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  side?: boolean; // panneau latéral plutôt que fenêtre centrée
  className?: string;
}

// Fenêtre native <dialog> : focus piégé, touche Échap et lecteurs d'écran gérés par le navigateur
const Dialog = ({ open, onClose, labelledBy, children, side, className }: DialogProps) => {
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
        "bg-card text-ink shadow-2xl",
        side
          ? "m-0 ml-auto h-dvh max-h-dvh w-full max-w-sm border-l border-line"
          : "m-auto w-[min(92vw,40rem)] max-h-[88dvh] rounded-2xl border border-line",
        className
      )}
    >
      {open && children}
    </dialog>
  );
};

export default Dialog;
