import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import PostCard from "../../components/community/PostCard";
import PageState from "../../components/PageState";
import { Container, Page } from "../../components/ui";
import { useMember } from "../../context/Member/MemberContext";
import { useApi } from "../../hooks/useApi";
import { Post } from "../../types/Community";

// Une publication seule (lien partagé), commentaires ouverts
const PostPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { token } = useMember();
  const navigate = useNavigate();
  const { data, loading, error } = useApi<Post>(`/community/posts/${id}`, token);

  return (
    <Page>
      <Container className="max-w-3xl py-10 sm:py-14">
        <Link to="/communaute" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-accent">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("community.backToFeed")}
        </Link>
        <div className="mt-6">
          <PageState loading={loading} error={error} />
          {data && (
            <PostCard
              post={data}
              defaultOpen
              onDeleted={() => navigate("/communaute")}
              onTagClick={(tag) => navigate(`/communaute?tag=${encodeURIComponent(tag)}`)}
            />
          )}
        </div>
      </Container>
    </Page>
  );
};

export default PostPage;
