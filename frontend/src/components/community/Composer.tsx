import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Send, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiSend, ApiError } from "../../api/client";
import { useMember } from "../../context/Member/MemberContext";
import { Post, POST_KINDS, PostKind } from "../../types/Community";
import { cn } from "../../utils/cn";
import { Button } from "../ui";
import Avatar from "./Avatar";
import { KIND_ICONS } from "./kindIcons";

const FIELD =
  "w-full rounded-xl border border-line bg-card px-4 py-2.5 text-ink placeholder:text-ink-soft/70 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15";

// Zone « Partager avec la communauté »
const Composer = ({ onPublished }: { onPublished: (post: Post) => void }) => {
  const { t } = useTranslation();
  const { member, token } = useMember();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<PostKind>("discussion");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  if (!member) return null;

  const reset = () => {
    setTitle("");
    setText("");
    setTags("");
    setImage(null);
    if (fileInput.current) fileInput.current.value = "";
    setKind("discussion");
    setOpen(false);
    setError(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (image && image.size > 8 * 1024 * 1024) {
      setError(t("community.composer.tooBig"));
      return;
    }
    const data = new FormData();
    data.set("kind", kind);
    if (title.trim()) data.set("title", title.trim());
    data.set("text", text.trim());
    data.set("tags", tags);
    if (image) {
      data.set("image", image);
      data.set("imageAlt", title.trim() || text.trim().slice(0, 120));
    }

    setSending(true);
    try {
      const post = await apiSend<Post>("/community/posts", "POST", data, token);
      onPublished(post);
      reset();
    } catch (err) {
      setError(err instanceof ApiError && err.message.length < 200 ? err.message : t("community.error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line/80 bg-card p-5 shadow-soft sm:p-6" aria-label={t("community.composer.label")}>
      <div className="flex gap-3">
        <Avatar name={member.displayName} id={member._id} />
        <div className="min-w-0 flex-1">
          <label htmlFor="composer-text" className="sr-only">
            {t("community.composer.placeholder")}
          </label>
          <textarea
            id="composer-text"
            value={text}
            onFocus={() => setOpen(true)}
            onChange={(event) => setText(event.target.value)}
            placeholder={t("community.composer.placeholder", { name: member.displayName.split(" ")[0] })}
            rows={open ? 4 : 2}
            maxLength={5000}
            required
            className={cn(FIELD, "resize-y rounded-2xl text-base transition-all")}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4 sm:pl-14">
              <fieldset>
                <legend className="text-sm font-semibold text-ink">{t("community.composer.kind")}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {POST_KINDS.map((value) => {
                    const Icon = KIND_ICONS[value];
                    return (
                      <label
                        key={value}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent/20",
                          kind === value ? "border-accent bg-accent-soft text-accent" : "border-line text-ink hover:border-ink/40"
                        )}
                      >
                        <input type="radio" name="kind" value={value} checked={kind === value} onChange={() => setKind(value)} className="sr-only" />
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {t(`community.kinds.${value}`)}
                      </label>
                    );
                  })}
                </div>
                <p className="mt-2 text-sm text-ink-soft">{t(`community.kindHints.${kind}`)}</p>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="composer-title" className="text-sm font-semibold text-ink">
                    {t("community.composer.title")}
                  </label>
                  <input id="composer-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={140} className={cn(FIELD, "mt-2")} />
                </div>
                <div>
                  <label htmlFor="composer-tags" className="text-sm font-semibold text-ink">
                    {t("community.composer.tags")}
                  </label>
                  <input
                    id="composer-tags"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder={t("community.composer.tagsPlaceholder")}
                    className={cn(FIELD, "mt-2")}
                  />
                </div>
              </div>

              {preview && (
                <div className="relative inline-block">
                  <img src={preview} alt="" className="max-h-56 rounded-2xl border border-line object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    aria-label={t("community.composer.removeImage")}
                    className="absolute right-2 top-2 rounded-full bg-ink/80 p-1.5 text-paper hover:bg-ink"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              {error && (
                <p role="alert" className="rounded-xl border border-accent/40 bg-accent-soft p-3 text-sm text-ink">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <div>
                  <input
                    ref={fileInput}
                    id="composer-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                  />
                  <label
                    htmlFor="composer-image"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-ink-soft hover:bg-ink/5 hover:text-ink"
                  >
                    <ImagePlus className="h-5 w-5 text-accent" aria-hidden="true" />
                    {t("community.composer.addImage")}
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={reset}>
                    {t("community.cancel")}
                  </Button>
                  <Button type="submit" disabled={sending || text.trim().length < 3}>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {sending ? t("community.composer.sending") : t("community.composer.publish")}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

export default Composer;
