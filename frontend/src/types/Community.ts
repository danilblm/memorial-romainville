export type PostKind = "discussion" | "question" | "archive" | "souvenir" | "recherche";
export const POST_KINDS: PostKind[] = ["discussion", "question", "archive", "souvenir", "recherche"];

export type MemberProfile = "descendant" | "chercheur" | "enseignant" | "passionne" | "habitant" | "autre";
export const MEMBER_PROFILES: MemberProfile[] = ["descendant", "chercheur", "enseignant", "passionne", "habitant", "autre"];

export interface AuthorSummary {
  _id: string | null;
  displayName: string;
  profile: MemberProfile;
}

export interface Member extends AuthorSummary {
  _id: string;
  bio: string;
  interests: string[];
  createdAt: string;
}

export interface Post {
  _id: string;
  author: AuthorSummary;
  kind: PostKind;
  title?: string;
  text: string;
  image?: { url: string; alt?: string };
  tags: string[];
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  isMine: boolean;
  createdAt: string;
}

export interface PostComment {
  _id: string;
  author: AuthorSummary;
  text: string;
  isMine: boolean;
  createdAt: string;
}

export interface FeedPage {
  posts: Post[];
  nextCursor: string | null;
}

export interface CommunityStats {
  members: number;
  posts: number;
  comments: number;
  tags: { tag: string; count: number }[];
  recentMembers: AuthorSummary[];
}

export interface MemberProfilePage {
  member: Member;
  stats: { posts: number; comments: number; likes: number };
  posts: Post[];
}

export interface MemberSession {
  token: string;
  member: Member;
}
