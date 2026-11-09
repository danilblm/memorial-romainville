import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, CircleCheck, FileUp, Lock, Send } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiSend } from "../api/client";
import { SelectInput, TextArea, TextInput } from "../components/FormField";
import { Button, Container, Page, PageHeader } from "../components/ui";
import { ContributionTarget } from "../types/Contribution";

const TARGETS: ContributionTarget[] = ["person", "place", "event", "source", "autre"];

const Step = ({ number, title, children }: { number: number; title: string; children: ReactNode }) => (
  <fieldset className="grid gap-6 border-t border-line pt-8 first:border-t-0 first:pt-0 md:grid-cols-[12rem_1fr]">
    <legend className="contents">
      <span className="flex items-center gap-3 md:items-start">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg text-paper">
          {number}
        </span>
        <span className="font-display text-xl text-ink md:mt-1">{title}</span>
      </span>
    </legend>
    <div className="space-y-5">{children}</div>
  </fieldset>
);

const ContributePage = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [files, setFiles] = useState<string[]>([]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("consentToPublish", "true");

    setState("sending");
    try {
      await apiSend("/contributions", "POST", data);
      setState("success");
      form.reset();
      setFiles([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setState("error");
    }
  };

  return (
    <Page>
      <PageHeader eyebrow={t("contribute.eyebrow")} title={t("contribute.title")} lead={t("contribute.intro")} />

      <Container className="max-w-4xl py-12">
        <AnimatePresence mode="wait">
          {state === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-leaf/40 bg-card p-10 text-center shadow-lg"
              role="status"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.15 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf/15 text-leaf"
              >
                <CircleCheck className="h-9 w-9" aria-hidden="true" />
              </motion.span>
              <h2 className="mt-6 font-display text-3xl text-ink">{t("contribute.successTitle")}</h2>
              <p className="mx-auto mt-3 max-w-md text-ink-soft">{t("contribute.success")}</p>
              <Button variant="secondary" className="mt-8" onClick={() => setState("idle")}>
                {t("contribute.another")}
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={submit}
              className="space-y-8 rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-10"
            >
              {state === "error" && (
                <div className="flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent-soft p-4" role="alert">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                  <p>{t("contribute.error")}</p>
                </div>
              )}

              <Step number={1} title={t("contribute.stepYou")}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput id="contributorName" name="contributorName" label={t("contribute.name")} required autoComplete="name" />
                  <TextInput
                    id="contributorEmail"
                    name="contributorEmail"
                    type="email"
                    label={t("contribute.email")}
                    required
                    autoComplete="email"
                  />
                </div>
                <TextInput id="contributorRelation" name="contributorRelation" label={t("contribute.relation")} />
                <p className="flex items-center gap-2 text-sm text-ink-soft">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  {t("contribute.privacy")}
                </p>
              </Step>

              <Step number={2} title={t("contribute.stepProposal")}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectInput id="targetKind" name="targetKind" label={t("contribute.targetKind")} defaultValue="person">
                    {TARGETS.map((kind) => (
                      <option key={kind} value={kind}>
                        {t(`contribute.kinds.${kind}`)}
                      </option>
                    ))}
                  </SelectInput>
                  <TextInput id="targetLabel" name="targetLabel" label={t("contribute.targetLabel")} />
                </div>
                <TextArea id="content" name="content" label={t("contribute.content")} required minLength={10} rows={6} />
                <TextArea id="declaredProvenance" name="declaredProvenance" label={t("contribute.provenance")} required rows={3} />
              </Step>

              <Step number={3} title={t("contribute.stepFiles")}>
                <div>
                  <p className="text-sm font-semibold text-ink">{t("contribute.files")}</p>
                  <label
                    htmlFor="files"
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-paper/60 px-6 py-10 text-center transition hover:border-accent hover:bg-accent-soft/40"
                  >
                    <FileUp className="h-8 w-8 text-accent" aria-hidden="true" />
                    <span className="font-medium text-ink">{t("contribute.filesHint")}</span>
                    {files.length > 0 && <span className="text-sm text-ink-soft">{files.join(" · ")}</span>}
                  </label>
                  <input
                    id="files"
                    name="files"
                    type="file"
                    multiple
                    accept="image/*,application/pdf,audio/*"
                    className="sr-only"
                    onChange={(event) => setFiles(Array.from(event.target.files ?? []).map((file) => file.name))}
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4 transition hover:border-ink/30">
                  <input type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-[var(--accent)]" />
                  <span className="text-ink">{t("contribute.consent")}</span>
                </label>
              </Step>

              <div className="flex justify-end border-t border-line pt-8">
                <Button type="submit" disabled={state === "sending"} className="px-7 py-3 text-base">
                  {state === "sending" ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" aria-hidden="true" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                  {state === "sending" ? t("contribute.sending") : t("contribute.submit")}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </Container>
    </Page>
  );
};

export default ContributePage;
