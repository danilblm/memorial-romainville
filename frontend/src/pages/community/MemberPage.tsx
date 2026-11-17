import { ArrowLeft, CalendarDays, LogOut, Pencil } from "lucide-react";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiSend, ApiError } from "../../api/client";
import Avatar from "../../components/community/Avatar";
import PostCard from "../../components/community/PostCard";
import { SelectInput, TextArea, TextInput } from "../../components/FormField";
import PageState from "../../components/PageState";
import { Button, Container, Page } from "../../components/ui";
import { useMember } from "../../context/Member/MemberContext";
import { useApi } from "../../hooks/useApi";
import { Member, MEMBER_PROFILES, MemberProfilePage } from "../../types/Community";

const ProfileEditor = ({ member, onSaved, onCancel }: { member: Member; onSaved: () => void; onCancel: () => void }) => {
  const { t } = useTranslation();
  const { token, updateMember } = useMember();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const updated = await apiSend<Member>(
        "/community/me",
        "PATCH",
        {
          displayName: data.get("displayName"),
          profile: data.get("profile"),
          bio: data.get("bio"),
          interests: String(data.get("interests") ?? "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        },
        token
      );
      updateMember(updated);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError && err.message.length < 200 ? err.message : t("community.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 space-y-5 rounded-3xl border border-line bg-card p-6 shadow-soft sm:p-8">
      <h2 className="font-display text-2xl text-ink">{t("community.editProfile")}</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput id="displayName" name="displayName" label={t("community.displayName")} defaultValue={member.displayName} required minLength={2} maxLength={60} />
        <SelectInput id="profile" name="profile" label={t("community.youAre")} defaultValue={member.profile}>
          {MEMBER_PROFILES.map((value) => (
            <option key={value} value={value}>
              {t(`community.profiles.${value}`)}
            </option>
          ))}
        </SelectInput>
      </div>
      <TextArea id="bio" name="bio" label={t("community.bio")} hint={t("community.bioHint")} defaultValue={member.bio} rows={4} maxLength={600} />
      <TextInput
        id="interests"
        name="interests"
        label={t("community.interests")}
        hint={t("community.interestsHint")}
        defaultValue={member.interests.join(", ")}
      />
      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("community.cancel")}
        </Button>
        <Button type="submit" disabled={saving}>
          {t("community.save")}
        </Button>
      </div>
    </form>
  );
};

const MemberPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { token, member: me, signOut } = useMember();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi<MemberProfilePage>(`/community/members/${id}`, token);
  const [editing, setEditing] = useState(false);
  const isMe = Boolean(me && me._id === id);

  const stats = data && [
    { value: data.stats.posts, label: t("community.stats.posts") },
    { value: data.stats.comments, label: t("community.stats.comments") },
    { value: data.stats.likes, label: t("community.stats.likesReceived") },
  ];

  return (
    <Page>
      <Container className="max-w-4xl py-10 sm:py-14">
        <Link to="/communaute" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-accent">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("community.backToFeed")}
        </Link>

        <PageState loading={loading} error={error} />

        {data && (
          <>
            <header className="mt-6 rounded-3xl border border-line bg-card p-6 shadow-soft sm:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <Avatar name={data.member.displayName} id={data.member._id} size="xl" />
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-4xl tracking-tight text-ink">{data.member.displayName}</h1>
                  <p className="mt-1 text-ink-soft">{t(`community.profiles.${data.member.profile}`)}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    {t("community.memberSince", {
                      date: new Date(data.member.createdAt).toLocaleDateString(i18n.language, { month: "long", year: "numeric" }),
                    })}
                  </p>
                </div>
                {isMe && !editing && (
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setEditing(true)}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      {t("community.editProfile")}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        signOut();
                        navigate("/communaute");
                      }}
                      aria-label={t("nav.logout")}
                      title={t("nav.logout")}
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>

              {data.member.bio && <p className="mt-6 max-w-2xl whitespace-pre-line leading-relaxed text-ink">{data.member.bio}</p>}
              {data.member.interests.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2" aria-label={t("community.interests")}>
                  {data.member.interests.map((interest) => (
                    <li key={interest}>
                      <Link to={`/communaute?tag=${encodeURIComponent(interest)}`} className="rounded-full bg-accent-soft px-3 py-1 text-sm text-accent hover:bg-accent hover:text-accent-ink">
                        #{interest}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {stats && (
                <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
                  {stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col-reverse">
                      <dt className="text-sm text-ink-soft">{stat.label}</dt>
                      <dd className="font-display text-3xl text-ink">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </header>

            {isMe && editing && me && (
              <ProfileEditor
                member={me}
                onCancel={() => setEditing(false)}
                onSaved={() => {
                  setEditing(false);
                  reload();
                }}
              />
            )}

            <section className="mt-10 space-y-6" aria-labelledby="member-posts">
              <h2 id="member-posts" className="font-display text-2xl text-ink">
                {isMe ? t("community.myPosts") : t("community.postsBy", { name: data.member.displayName })}
              </h2>
              {data.posts.length === 0 && <p className="text-ink-soft">{t("community.noPostsYet")}</p>}
              {data.posts.map((post) => (
                <PostCard key={post._id} post={post} onDeleted={() => reload()} onTagClick={(tag) => navigate(`/communaute?tag=${encodeURIComponent(tag)}`)} />
              ))}
            </section>
          </>
        )}
      </Container>
    </Page>
  );
};

export default MemberPage;
