import { motion } from "framer-motion";
import { Flag, Heart, Languages, Link2, MessageCircle, Trash2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { apiSend } from "../../api/client";
import { useMember } from "../../context/Member/MemberContext";
import { Post } from "../../types/Community";
import { cn } from "../../utils/cn";
import { mediaUrl } from "../../utils/mediaUrl";
import { timeAgo } from "../../utils/timeAgo";
import Avatar from "./Avatar";
import CommentThread from "./CommentThread";
import { KIND_ICONS } from "./kindIcons";
import ReportDialog from "./ReportDialog";


interface PostCardProps {
  post: Post;
  onTagClick?: (tag: string) => void;
  onDeleted?: (id: string) => void;
  defaultOpen?: boolean;
}

const LONG_TEXT = 420;

// Les publications sont écrites par les membres (souvent en français) : on ne les réécrit pas,
// mais en anglais on propose de les ouvrir dans Google Traduction (nouvel onglet).
const translateUrl = (text: string, target: string) =>
  `https://translate.google.com/?sl=auto&tl=${target}&op=translate&text=${encodeURIComponent(text.slice(0, 1800))}`;

const PostCard = ({ post, onTagClick, onDeleted, defaultOpen = false }: PostCardProps) => {
  const { t, i18n } = useTranslation();
  const { token, isMember } = useMember();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showComments, setShowComments] = useState(defaultOpen);
  const [expanded, setExpanded] = useState(post.text.length <= LONG_TEXT);
  const [reporting, setReporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const KindIcon = KIND_ICONS[post.kind];

  const toggleLike = async () => {
    if (!isMember) {
      navigate("/communaute/rejoindre");
      return;
    }
    // Réponse immédiate, corrigée par le serveur
    setLiked(!liked);
    setLikeCount((count) => count + (liked ? -1 : 1));
    try {
      const result = await apiSend<{ liked: boolean; likeCount: number }>(`/community/posts/${post._id}/like`, "POST", undefined, token);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      setLiked(liked);
      setLikeCount(post.likeCount);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/communaute/publication/${post._id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      navigate(`/communaute/publication/${post._id}`);
    }
  };

  const remove = async () => {
    if (!window.confirm(t("community.confirmDeletePost"))) return;
    await apiSend(`/community/posts/${post._id}`, "DELETE", undefined, token);
    onDeleted?.(post._id);
  };

  const action = "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-ink/5 hover:text-ink";

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-3xl border border-line/80 bg-card shadow-soft"
      aria-labelledby={`post-${post._id}-author`}
    >
      <div className="p-5 sm:p-6">
        {/* Auteur */}
        <header className="flex items-start gap-3">
          <Avatar name={post.author.displayName} id={post.author._id} />
          <div className="min-w-0 flex-1">
            <p id={`post-${post._id}-author`} className="font-semibold text-ink">
              {post.author._id ? (
                <Link to={`/communaute/membres/${post.author._id}`} className="hover:text-accent">
                  {post.author.displayName}
                </Link>
              ) : (
                post.author.displayName
              )}
            </p>
            <p className="text-sm text-ink-soft">
              {t(`community.profiles.${post.author.profile}`)} ·{" "}
              <Link to={`/communaute/publication/${post._id}`} className="hover:underline">
                <time dateTime={post.createdAt}>{timeAgo(post.createdAt, i18n.language)}</time>
              </Link>
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1 text-xs font-semibold text-ink">
            <KindIcon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {t(`community.kinds.${post.kind}`)}
          </span>
        </header>

        {/* Contenu */}
        {post.title && <h2 className="mt-5 font-display text-2xl leading-snug tracking-tight text-ink">{post.title}</h2>}
        <p className={cn("whitespace-pre-line leading-relaxed text-ink", post.title ? "mt-2" : "mt-5")}>
          {expanded ? post.text : `${post.text.slice(0, LONG_TEXT).trimEnd()}…`}
        </p>
        {!expanded && (
          <button type="button" onClick={() => setExpanded(true)} className="mt-1 text-sm font-semibold text-accent">
            {t("community.readMore")}
          </button>
        )}
        {!i18n.language.startsWith("fr") && (
          <a
            href={translateUrl([post.title, post.text].filter(Boolean).join("\n\n"), i18n.language.slice(0, 2))}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            <Languages className="h-4 w-4" aria-hidden="true" />
            {t("community.translate")}
            <span className="sr-only">{t("community.newTab")}</span>
          </a>
        )}

        {post.image && (
          <a href={mediaUrl(post.image.url)} target="_blank" rel="noreferrer" className="mt-5 block overflow-hidden rounded-2xl border border-line bg-paper-2">
            <img src={mediaUrl(post.image.url)} alt={post.image.alt ?? ""} loading="lazy" className="max-h-[28rem] w-full object-cover" />
          </a>
        )}

        {post.kind === "archive" && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-line bg-paper-2 p-3 text-sm text-ink-soft">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>
              {t("community.unverified")}{" "}
              <Link to="/contribuer" className="font-semibold text-accent hover:underline">
                {t("community.proposeToMemorial")}
              </Link>
            </span>
          </p>
        )}

        {post.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label={t("community.tags")}>
            {post.tags.map((tag) => (
              <li key={tag}>
                <button
                  type="button"
                  onClick={() => onTagClick?.(tag)}
                  disabled={!onTagClick}
                  className="rounded-full bg-accent-soft px-3 py-1 text-sm text-accent transition enabled:hover:bg-accent enabled:hover:text-accent-ink"
                >
                  #{tag}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <footer className="flex flex-wrap items-center gap-1 border-t border-line px-3 py-2 sm:px-4">
        <button type="button" onClick={toggleLike} aria-pressed={liked} className={cn(action, liked && "text-accent hover:text-accent")}>
          <motion.span key={String(liked)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
            <Heart className={cn("h-5 w-5", liked && "fill-current")} aria-hidden="true" />
          </motion.span>
          {likeCount}
          <span className="sr-only">{t("community.likes")}</span>
        </button>
        <button type="button" onClick={() => setShowComments(!showComments)} aria-expanded={showComments} className={action}>
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          {commentCount}
          <span className="sr-only">{t("community.comments")}</span>
        </button>
        <button type="button" onClick={copyLink} className={action}>
          <Link2 className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">{copied ? t("community.copied") : t("community.share")}</span>
        </button>
        <span className="ml-auto" />
        {isMember && post.isMine && (
          <button type="button" onClick={remove} className={action}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("community.delete")}</span>
          </button>
        )}
        {isMember && !post.isMine && (
          <button type="button" onClick={() => setReporting(true)} className={action}>
            <Flag className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("community.report.action")}</span>
          </button>
        )}
      </footer>

      {showComments && <CommentThread postId={post._id} onCountChange={setCommentCount} />}

      <ReportDialog open={reporting} onClose={() => setReporting(false)} path={`/community/posts/${post._id}/report`} />
    </motion.article>
  );
};

export default PostCard;
