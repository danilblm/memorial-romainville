import { ArrowRight, Hash, Search, ShieldCheck, Users, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { apiGet } from "../../api/client";
import AnimatedNumber from "../../components/AnimatedNumber";
import Avatar from "../../components/community/Avatar";
import Composer from "../../components/community/Composer";
import { KIND_ICONS } from "../../components/community/kindIcons";
import PostCard from "../../components/community/PostCard";
import PageState from "../../components/PageState";
import { Button, ButtonLink, Container, Eyebrow, Page } from "../../components/ui";
import { useMember } from "../../context/Member/MemberContext";
import { useApi } from "../../hooks/useApi";
import { CommunityStats, FeedPage, Post, POST_KINDS, PostKind } from "../../types/Community";
import { cn } from "../../utils/cn";

const CHARTER = ["respect", "sources", "privacy", "memorial"] as const;

const CommunityPage = () => {
  const { t } = useTranslation();
  const { member, token, isMember } = useMember();
  const [params, setParams] = useSearchParams();
  const kind = (POST_KINDS.find((value) => value === params.get("type")) ?? "") as PostKind | "";
  const tag = params.get("tag") ?? "";
  const [search, setSearch] = useState(params.get("q") ?? "");
  const q = params.get("q") ?? "";

  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: stats, reload: reloadStats } = useApi<CommunityStats>("/community/stats");

  const setFilter = (key: "type" | "tag" | "q", value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const query = useMemo(() => {
    const search = new URLSearchParams();
    if (kind) search.set("kind", kind);
    if (tag) search.set("tag", tag);
    if (q) search.set("q", q);
    return search;
  }, [kind, tag, q]);

  const load = useCallback(
    async (before?: string) => {
      const search = new URLSearchParams(query);
      search.set("limit", "8");
      if (before) search.set("before", before);
      return apiGet<FeedPage>(`/community/posts?${search}`, token);
    },
    [query, token]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .then((page) => {
        if (cancelled) return;
        setPosts(page.posts);
        setCursor(page.nextCursor);
        setError(null);
      })
      .catch((err: { status?: number }) => !cancelled && setError(String(err.status ?? "error")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [load]);

  // Recherche : on attend la fin de la saisie
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim() !== q) setFilter("q", search.trim());
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const loadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const page = await load(cursor);
      setPosts((current) => [...current, ...page.posts]);
      setCursor(page.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  };

  const hasFilter = Boolean(kind || tag || q);

  return (
    <Page>
      {/* En-tête */}
      <header className="relative overflow-hidden border-b border-line bg-paper-2">
        <img
          src="/images/histoire/rangee-casemates.jpg"
          alt=""
          className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-25 grayscale lg:block"
        />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-paper-2 via-paper-2/95 to-paper-2/30 lg:block" aria-hidden="true" />
        <Container className="relative py-14 sm:py-20">
          <Eyebrow>{t("community.eyebrow")}</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-medium leading-[1.04] tracking-tight text-balance text-ink sm:text-6xl">
            {t("community.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-ink-soft">{t("community.intro")}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {isMember ? (
              <ButtonLink to={`/communaute/membres/${member?._id}`} variant="secondary">
                <Avatar name={member?.displayName ?? ""} id={member?._id} size="sm" className="-ml-2" />
                {t("community.myProfile")}
              </ButtonLink>
            ) : (
              <>
                <ButtonLink to="/communaute/rejoindre" className="px-6 py-3">
                  {t("community.join")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <Link to="/communaute/rejoindre?mode=connexion" className="text-sm font-semibold text-ink hover:text-accent">
                  {t("community.alreadyMember")}
                </Link>
              </>
            )}
          </div>

          {stats && (
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                { value: stats.members, label: t("community.stats.members") },
                { value: stats.posts, label: t("community.stats.posts") },
                { value: stats.comments, label: t("community.stats.comments") },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-sm text-ink-soft">{stat.label}</dt>
                  <dd className="font-display text-4xl text-ink">
                    <AnimatedNumber value={stat.value} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Container>
      </header>

      <Container className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Fil */}
        <section aria-labelledby="feed-title" className="min-w-0 space-y-6">
          <h2 id="feed-title" className="sr-only">
            {t("community.feed")}
          </h2>

          {isMember ? (
            <Composer
              onPublished={(post) => {
                setPosts((current) => [post, ...current]);
                reloadStats();
              }}
            />
          ) : (
            <div className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-6 shadow-soft sm:flex-row sm:items-center">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Users className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="font-display text-xl text-ink">{t("community.joinCardTitle")}</p>
                <p className="mt-1 text-ink-soft">{t("community.joinCardLead")}</p>
              </div>
              <ButtonLink to="/communaute/rejoindre">{t("community.join")}</ButtonLink>
            </div>
          )}

          {/* Filtres */}
          <div className="space-y-4">
            <label className="relative block">
              <span className="sr-only">{t("community.search")}</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("community.search")}
                className="w-full rounded-full border border-line bg-card py-3 pl-11 pr-4 text-ink placeholder:text-ink-soft/70 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
              />
            </label>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="group" aria-label={t("community.filterKind")}>
              {(["", ...POST_KINDS] as const).map((value) => {
                const Icon = value ? KIND_ICONS[value] : null;
                return (
                  <button
                    key={value || "all"}
                    type="button"
                    aria-pressed={kind === value}
                    onClick={() => setFilter("type", value)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition",
                      kind === value ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink hover:border-ink/40"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                    {value ? t(`community.kindsPlural.${value}`) : t("community.allPosts")}
                  </button>
                );
              })}
            </div>
            {(tag || q) && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {tag && (
                  <button
                    type="button"
                    onClick={() => setFilter("tag", "")}
                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-accent-ink"
                  >
                    #{tag}
                    <X className="h-3.5 w-3.5" aria-label={t("community.clearFilter")} />
                  </button>
                )}
                {q && (
                  <span className="text-ink-soft">
                    {t("community.resultsFor")} « {q} »
                  </span>
                )}
              </div>
            )}
          </div>

          <PageState loading={loading} error={error} />

          {!loading && posts.length === 0 && !error && (
            <div className="rounded-3xl border border-dashed border-line bg-paper-2 p-12 text-center">
              <p className="font-display text-2xl text-ink">{hasFilter ? t("community.noResults") : t("community.empty")}</p>
              <p className="mx-auto mt-2 max-w-md text-ink-soft">{t("community.emptyLead")}</p>
            </div>
          )}

          {!loading &&
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onTagClick={(value) => {
                  setFilter("tag", value);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onDeleted={(id) => {
                  setPosts((current) => current.filter((item) => item._id !== id));
                  reloadStats();
                }}
              />
            ))}

          {cursor && !loading && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? t("common.loading") : t("community.loadMore")}
              </Button>
            </div>
          )}
        </section>

        {/* Colonne latérale */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label={t("community.aside")}>
          <section className="rounded-3xl border border-line bg-card p-6" aria-labelledby="charter-title">
            <h2 id="charter-title" className="flex items-center gap-2 font-display text-xl text-ink">
              <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
              {t("community.charter.title")}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
              {CHARTER.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {t(`community.charter.${rule}`)}
                </li>
              ))}
            </ul>
          </section>

          {stats && stats.tags.length > 0 && (
            <section className="rounded-3xl border border-line bg-card p-6" aria-labelledby="tags-title">
              <h2 id="tags-title" className="flex items-center gap-2 font-display text-xl text-ink">
                <Hash className="h-5 w-5 text-accent" aria-hidden="true" />
                {t("community.popularTags")}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {stats.tags.map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => setFilter("tag", tag === item.tag ? "" : item.tag)}
                    aria-pressed={tag === item.tag}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm transition",
                      tag === item.tag ? "bg-accent text-accent-ink" : "bg-accent-soft text-accent hover:bg-accent hover:text-accent-ink"
                    )}
                  >
                    #{item.tag} <span className="opacity-60">{item.count}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {stats && stats.recentMembers.length > 0 && (
            <section className="rounded-3xl border border-line bg-card p-6" aria-labelledby="members-title">
              <h2 id="members-title" className="font-display text-xl text-ink">
                {t("community.newMembers")}
              </h2>
              <ul className="mt-4 space-y-3">
                {stats.recentMembers.map((item) => (
                  <li key={item._id}>
                    <Link to={`/communaute/membres/${item._id}`} className="group flex items-center gap-3">
                      <Avatar name={item.displayName} id={item._id} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink group-hover:text-accent">{item.displayName}</span>
                        <span className="block text-xs text-ink-soft">{t(`community.profiles.${item.profile}`)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-3xl bg-ink p-6 text-paper">
            <h2 className="font-display text-xl">{t("community.toMemorialTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed opacity-80">{t("community.toMemorialLead")}</p>
            <div className="mt-4 flex flex-col gap-2 text-sm font-semibold">
              <Link to="/contribuer" className="inline-flex items-center gap-1.5 hover:underline">
                {t("nav.contribute")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/archives" className="inline-flex items-center gap-1.5 hover:underline">
                {t("nav.archives")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </aside>
      </Container>
    </Page>
  );
};

export default CommunityPage;
