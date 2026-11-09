import { Accessibility, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccessibility } from "../context/Accessibility/AccessibilityContext";
import { cn } from "../utils/cn";
import Dialog from "./Dialog";
import LanguageSwitcher from "./LanguageSwitcher";

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between gap-4 rounded-xl border border-line px-4 py-3 text-left transition hover:border-ink/40"
  >
    <span className="font-medium">{label}</span>
    <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-accent" : "bg-line")}>
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform",
          checked && "translate-x-5"
        )}
      />
    </span>
  </button>
);

const AccessibilityPanel = () => {
  const { t } = useTranslation();
  const { settings, update, reset } = useAccessibility();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("a11y.open")}
        title={t("a11y.open")}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-ink transition hover:border-ink/40"
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} labelledBy="a11y-title" side>
        <div className="flex h-full flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <h2 id="a11y-title" className="font-display text-2xl">
              {t("a11y.title")}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("nav.close")}
              className="rounded-full p-2 hover:bg-ink/5"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div>
            <label htmlFor="font-scale" className="flex items-baseline justify-between font-medium">
              {t("a11y.textSize")}
              <span className="text-sm text-ink-soft">{Math.round(settings.fontScale * 100)} %</span>
            </label>
            <input
              id="font-scale"
              type="range"
              min={0.9}
              max={1.6}
              step={0.1}
              value={settings.fontScale}
              onChange={(event) => update({ fontScale: Number(event.target.value) })}
              className="mt-3 w-full accent-[var(--accent)]"
            />
            <div className="mt-1 flex justify-between text-ink-soft" aria-hidden="true">
              <span className="text-sm">A</span>
              <span className="text-xl">A</span>
            </div>
          </div>

          <div className="space-y-3">
            <Toggle label={t("a11y.contrast")} checked={settings.highContrast} onChange={(value) => update({ highContrast: value })} />
            <Toggle label={t("a11y.dyslexic")} checked={settings.dyslexicFont} onChange={(value) => update({ dyslexicFont: value })} />
          </div>

          <div>
            <p className="mb-2 font-medium">{t("a11y.language")}</p>
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold hover:border-ink/40"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t("a11y.reset")}
          </button>
        </div>
      </Dialog>
    </>
  );
};

export default AccessibilityPanel;
