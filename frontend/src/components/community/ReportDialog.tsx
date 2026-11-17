import { Flag, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiSend } from "../../api/client";
import { useMember } from "../../context/Member/MemberContext";
import Dialog from "../Dialog";
import { TextArea } from "../FormField";
import { Button } from "../ui";

const REASONS = ["inexact", "irrespectueux", "personnel", "spam"] as const;

// Signaler une publication ou un commentaire à l'équipe du mémorial
const ReportDialog = ({ open, onClose, path }: { open: boolean; onClose: () => void; path: string }) => {
  const { t } = useTranslation();
  const { token } = useMember();
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const close = () => {
    setState("idle");
    setDetails("");
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setState("sending");
    try {
      const label = t(`community.report.reasons.${reason}`);
      await apiSend(path, "POST", { reason: details.trim() ? `${label} – ${details.trim()}` : label }, token);
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <Dialog open={open} onClose={close} labelledBy="report-title">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="report-title" className="flex items-center gap-2 font-display text-2xl text-ink">
            <Flag className="h-5 w-5 text-accent" aria-hidden="true" />
            {t("community.report.title")}
          </h2>
          <button type="button" onClick={close} aria-label={t("nav.close")} className="rounded-full p-2 hover:bg-ink/5">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {state === "done" ? (
          <div role="status">
            <p className="mt-4 text-ink-soft">{t("community.report.done")}</p>
            <Button className="mt-6" onClick={close}>
              {t("nav.close")}
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-5">
            <p className="text-ink-soft">{t("community.report.lead")}</p>
            <fieldset className="grid gap-2">
              <legend className="sr-only">{t("community.report.title")}</legend>
              {REASONS.map((value) => (
                <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-3 hover:border-ink/30">
                  <input
                    type="radio"
                    name="reason"
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  <span className="text-ink">{t(`community.report.reasons.${value}`)}</span>
                </label>
              ))}
            </fieldset>
            <TextArea
              id="report-details"
              label={t("community.report.details")}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={3}
              maxLength={400}
            />
            {state === "error" && (
              <p role="alert" className="text-sm text-accent">
                {t("community.error")}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={close}>
                {t("community.cancel")}
              </Button>
              <Button type="submit" disabled={state === "sending"}>
                {t("community.report.submit")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
};

export default ReportDialog;
