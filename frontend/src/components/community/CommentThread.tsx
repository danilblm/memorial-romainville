import { Flag, Send, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { apiSend } from "../../api/client";
import { useMember } from "../../context/Member/MemberContext";
import { useApi } from "../../hooks/useApi";
import { PostComment } from "../../types/Community";
import { useAutoTranslate } from "../../hooks/useAutoTranslate";
import { timeAgo } from "../../utils/timeAgo";
import Avatar from "./Avatar";
import ReportDialog from "./ReportDialog";

// Texte d'un commentaire, traduit automatiquement quand le site n'est pas en français
const CommentText = ({ text }: { text: string }) => {
  const { t } = useTranslation();
  const auto = useAutoTranslate([text]);
  return (
    <>
      <p className="mt-1 whitespace-pre-line text-ink" title={auto.isTranslated ? text : undefined}>
        {auto.texts[0]}
      </p>
      {auto.isTranslated && <p className="mt-1 text-xs text-ink-soft">{t("community.autoTranslated")}</p>}
    </>
  );
};

interface CommentThreadProps {
  postId: string;
  onCountChange: (count: number) => void;
}

const CommentThread = ({ postId, onCountChange }: CommentThreadProps) => {
  const { t, i18n } = useTranslation();
  const { token, member, isMember } = useMember();
  const { data, loading, reload } = useApi<PostComment[]>(`/community/posts/${postId}/comments`, token);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [reporting, setReporting] = useState<string | null>(null);

  const refresh = async () => {
    reload();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await apiSend(`/community/posts/${postId}/comments`, "POST", { text }, token);
      setText("");
      onCountChange((data?.length ?? 0) + 1);
      await refresh();
    } finally {
      setSending(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t("community.confirmDeleteComment"))) return;
    await apiSend(`/community/comments/${id}`, "DELETE", undefined, token);
    onCountChange(Math.max((data?.length ?? 1) - 1, 0));
    await refresh();
  };

  return (
    <div className="border-t border-line bg-paper-2/60 px-5 py-5 sm:px-6">
      {loading && !data && <p className="text-sm text-ink-soft">{t("common.loading")}</p>}
      {data && data.length === 0 && <p className="text-sm text-ink-soft">{t("community.noComments")}</p>}

      <ul className="space-y-4">
        {data?.map((comment) => (
          <li key={comment._id} className="group flex gap-3">
            <Avatar name={comment.author.displayName} id={comment.author._id} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="rounded-2xl rounded-tl-sm bg-card px-4 py-3 shadow-soft">
                <p className="text-sm">
                  {comment.author._id ? (
                    <Link to={`/communaute/membres/${comment.author._id}`} className="font-semibold text-ink hover:text-accent">
                      {comment.author.displayName}
                    </Link>
                  ) : (
                    <span className="font-semibold text-ink">{comment.author.displayName}</span>
                  )}
                  <span className="ml-2 text-ink-soft">{timeAgo(comment.createdAt, i18n.language)}</span>
                </p>
                <CommentText text={comment.text} />
              </div>
              {isMember && (
                <div className="mt-1 flex gap-3 pl-2 text-xs text-ink-soft">
                  {comment.isMine ? (
                    <button type="button" onClick={() => remove(comment._id)} className="inline-flex items-center gap-1 hover:text-accent">
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("community.delete")}
                    </button>
                  ) : (
                    <button type="button" onClick={() => setReporting(comment._id)} className="inline-flex items-center gap-1 hover:text-accent">
                      <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("community.report.action")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {isMember && member ? (
        <form onSubmit={submit} className="mt-5 flex items-end gap-3">
          <Avatar name={member.displayName} id={member._id} size="sm" />
          <label className="sr-only" htmlFor={`comment-${postId}`}>
            {t("community.writeComment")}
          </label>
          <textarea
            id={`comment-${postId}`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              // Entrée envoie, Maj+Entrée va à la ligne
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder={t("community.writeComment")}
            rows={1}
            maxLength={2000}
            className="min-h-11 flex-1 resize-y rounded-2xl border border-line bg-card px-4 py-2.5 text-ink placeholder:text-ink-soft/70 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            aria-label={t("community.send")}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition hover:brightness-110 disabled:opacity-40"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      ) : (
        <p className="mt-5 text-sm text-ink-soft">
          <Link to="/communaute/rejoindre" className="font-semibold text-accent hover:underline">
            {t("community.joinToComment")}
          </Link>
        </p>
      )}

      <ReportDialog
        open={Boolean(reporting)}
        onClose={() => setReporting(null)}
        path={`/community/comments/${reporting}/report`}
      />
    </div>
  );
};

export default CommentThread;
