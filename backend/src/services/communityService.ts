import bcrypt from "bcrypt";
import { isValidObjectId, Types } from "mongoose";
import { generateMemberJWT } from "../middlewares/memberAuth";
import commentModel from "../models/commentModel";
import memberModel, { MemberDocument } from "../models/memberModel";
import postModel from "../models/postModel";
import { deleteStoredFile } from "../storage/fileStore";
import { CommunityStatus, MemberProfile, PostKind } from "../types/common";

// ------------------------------------------------------------------
// Ce qui sort de l'API : jamais d'e-mail, de mot de passe ni de signalements
// ------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
const publicMember = (member: any) =>
  member && {
    _id: member._id,
    displayName: member.displayName,
    profile: member.profile,
    bio: member.bio ?? "",
    interests: member.interests ?? [],
    createdAt: member.createdAt,
  };

const authorSummary = (member: any) =>
  member
    ? { _id: member._id, displayName: member.displayName, profile: member.profile }
    : { _id: null, displayName: "Membre supprimé", profile: "autre" };

const publicPost = (post: any, viewerId?: string) => {
  const likes: Types.ObjectId[] = post.likes ?? [];
  return {
    _id: post._id,
    author: authorSummary(post.author),
    kind: post.kind,
    title: post.title,
    text: post.text,
    image: post.image?.url ? post.image : undefined,
    tags: post.tags ?? [],
    likeCount: likes.length,
    likedByMe: viewerId ? likes.some((id) => String(id) === viewerId) : false,
    commentCount: post.commentCount ?? 0,
    isMine: viewerId ? String(post.author?._id ?? post.author) === viewerId : false,
    createdAt: post.createdAt,
  };
};

const publicComment = (comment: any, viewerId?: string) => ({
  _id: comment._id,
  author: authorSummary(comment.author),
  text: comment.text,
  isMine: viewerId ? String(comment.author?._id ?? comment.author) === viewerId : false,
  createdAt: comment.createdAt,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

const AUTHOR_FIELDS = "displayName profile";

const normalizeTags = (tags?: string[]) =>
  Array.from(
    new Set(
      (tags ?? [])
        .map((tag) => tag.trim().replace(/^#/, "").toLowerCase())
        .filter((tag) => tag.length > 1 && tag.length <= 30)
    )
  ).slice(0, 5);

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ------------------------------------------------------------------
// Comptes des membres
// ------------------------------------------------------------------

const session = (member: MemberDocument) => ({
  token: generateMemberJWT(String(member._id)),
  member: publicMember(member),
});

interface RegisterParams {
  displayName: string;
  email: string;
  password: string;
  profile: MemberProfile;
}

export const registerMember = async (params: RegisterParams) => {
  if (await memberModel.findOne({ email: params.email })) {
    return { statusCode: 400, data: { message: "Un compte existe déjà avec cette adresse." } };
  }
  const member = await memberModel.create({ ...params, password: await bcrypt.hash(params.password, 10) });
  return { statusCode: 201, data: session(member) };
};

export const loginMember = async (email: string, password: string) => {
  const member = await memberModel.findOne({ email });
  if (!member || !(await bcrypt.compare(password, member.password))) {
    return { statusCode: 400, data: { message: "E-mail ou mot de passe incorrect." } };
  }
  if (member.suspended) {
    return { statusCode: 403, data: { message: "Ce compte a été suspendu par l'équipe." } };
  }
  return { statusCode: 200, data: session(member) };
};

export const getMe = (member: MemberDocument) => publicMember(member);

interface ProfileUpdate {
  displayName?: string;
  profile?: MemberProfile;
  bio?: string;
  interests?: string[];
}

export const updateMe = async (member: MemberDocument, update: ProfileUpdate) => {
  if (update.displayName !== undefined) member.displayName = update.displayName;
  if (update.profile !== undefined) member.profile = update.profile;
  if (update.bio !== undefined) member.bio = update.bio;
  if (update.interests !== undefined) member.interests = normalizeTags(update.interests);
  await member.save();
  return publicMember(member);
};

export const getMemberProfile = async (id: string, viewerId?: string) => {
  if (!isValidObjectId(id)) return null;
  const member = await memberModel.findOne({ _id: id, suspended: false }).lean();
  if (!member) return null;

  const posts = await postModel
    .find({ author: id, status: "publie" })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("author", AUTHOR_FIELDS)
    .lean();

  const commentCount = await commentModel.countDocuments({ author: id, status: "publie" });
  const likeCount = posts.reduce((total, post) => total + (post.likes?.length ?? 0), 0);

  return {
    member: publicMember(member),
    stats: { posts: posts.length, comments: commentCount, likes: likeCount },
    posts: posts.map((post) => publicPost(post, viewerId)),
  };
};

// ------------------------------------------------------------------
// Publications
// ------------------------------------------------------------------

interface FeedFilters {
  kind?: PostKind;
  tag?: string;
  q?: string;
  before?: string;
  limit?: number;
}

export const listPosts = async (filters: FeedFilters, viewerId?: string) => {
  const query: Record<string, unknown> = { status: "publie" };
  if (filters.kind) query.kind = filters.kind;
  if (filters.tag) query.tags = filters.tag.toLowerCase();
  if (filters.q) {
    const pattern = new RegExp(escapeRegex(filters.q.slice(0, 100)), "i");
    query.$or = [{ title: pattern }, { text: pattern }, { tags: pattern }];
  }
  const before = filters.before ? new Date(filters.before) : null;
  if (before && !Number.isNaN(before.getTime())) query.createdAt = { $lt: before };

  const limit = Math.min(Math.max(filters.limit ?? 10, 1), 30);
  const posts = await postModel
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate("author", AUTHOR_FIELDS)
    .lean();

  const hasMore = posts.length > limit;
  const page = posts.slice(0, limit);
  return {
    posts: page.map((post) => publicPost(post, viewerId)),
    nextCursor: hasMore ? page[page.length - 1].createdAt : null,
  };
};

export const getPost = async (id: string, viewerId?: string) => {
  if (!isValidObjectId(id)) return null;
  const post = await postModel.findOne({ _id: id, status: "publie" }).populate("author", AUTHOR_FIELDS).lean();
  return post ? publicPost(post, viewerId) : null;
};

interface NewPost {
  kind: PostKind;
  title?: string;
  text: string;
  tags?: string[];
  imageAlt?: string;
}

export const createPost = async (member: MemberDocument, input: NewPost, image?: Express.Multer.File) => {
  const post = await postModel.create({
    author: member._id,
    kind: input.kind,
    title: input.title || undefined,
    text: input.text,
    tags: normalizeTags(input.tags),
    image: image ? { url: `/community-media/${image.filename}`, alt: input.imageAlt || input.title || "" } : undefined,
  });
  await post.populate("author", AUTHOR_FIELDS);
  return publicPost(post.toObject(), String(member._id));
};

const removeImageFile = (url?: string | null) => {
  if (!url?.startsWith("/community-media/")) return;
  deleteStoredFile("community", url.split("/").pop() ?? "").catch(() => undefined);
};

export const deleteOwnPost = async (member: MemberDocument, id: string) => {
  if (!isValidObjectId(id)) return false;
  const post = await postModel.findOne({ _id: id, author: member._id });
  if (!post) return false;
  removeImageFile(post.image?.url);
  await commentModel.deleteMany({ post: post._id });
  await post.deleteOne();
  return true;
};

export const toggleLike = async (member: MemberDocument, id: string) => {
  if (!isValidObjectId(id)) return null;
  const post = await postModel.findOne({ _id: id, status: "publie" });
  if (!post) return null;

  const memberId = String(member._id);
  const liked = post.likes.some((likeId) => String(likeId) === memberId);
  await postModel.updateOne({ _id: id }, liked ? { $pull: { likes: member._id } } : { $addToSet: { likes: member._id } });
  return { liked: !liked, likeCount: post.likes.length + (liked ? -1 : 1) };
};

// ------------------------------------------------------------------
// Commentaires
// ------------------------------------------------------------------

export const listComments = async (postId: string, viewerId?: string) => {
  if (!isValidObjectId(postId)) return null;
  if (!(await postModel.exists({ _id: postId, status: "publie" }))) return null;
  const comments = await commentModel
    .find({ post: postId, status: "publie" })
    .sort({ createdAt: 1 })
    .populate("author", AUTHOR_FIELDS)
    .lean();
  return comments.map((comment) => publicComment(comment, viewerId));
};

export const addComment = async (member: MemberDocument, postId: string, text: string) => {
  if (!isValidObjectId(postId)) return null;
  const post = await postModel.findOne({ _id: postId, status: "publie" });
  if (!post) return null;

  const comment = await commentModel.create({ post: post._id, author: member._id, text });
  await postModel.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });
  await comment.populate("author", AUTHOR_FIELDS);
  return publicComment(comment.toObject(), String(member._id));
};

const recountComments = async (postId: unknown) => {
  const count = await commentModel.countDocuments({ post: postId, status: "publie" });
  await postModel.updateOne({ _id: postId }, { commentCount: count });
};

export const deleteOwnComment = async (member: MemberDocument, id: string) => {
  if (!isValidObjectId(id)) return false;
  const comment = await commentModel.findOne({ _id: id, author: member._id });
  if (!comment) return false;
  await comment.deleteOne();
  await recountComments(comment.post);
  return true;
};

// ------------------------------------------------------------------
// Signalements (membres) et modération (équipe)
// ------------------------------------------------------------------

export const reportContent = async (kind: "post" | "comment", member: MemberDocument, id: string, reason: string) => {
  if (!isValidObjectId(id)) return false;
  const model = kind === "post" ? postModel : commentModel;
  const result = await (model as typeof postModel).updateOne(
    { _id: id, "reports.by": { $ne: member._id } },
    { $push: { reports: { by: member._id, reason, at: new Date() } } }
  );
  // Déjà signalé par ce membre : on répond quand même « reçu »
  return result.matchedCount > 0 || Boolean(await model.exists({ _id: id }));
};

export type ModerationFilter = "reported" | "hidden" | "all";

const moderationQuery = (filter: ModerationFilter) => {
  if (filter === "reported") return { "reports.0": { $exists: true }, status: "publie" };
  if (filter === "hidden") return { status: "masque" };
  return {};
};

export const listPostsForModeration = async (filter: ModerationFilter) => {
  return await postModel
    .find(moderationQuery(filter))
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("author", "displayName profile email")
    .populate("reports.by", "displayName")
    .populate("moderation.by", "firstName lastName")
    .lean();
};

export const listCommentsForModeration = async (filter: ModerationFilter) => {
  return await commentModel
    .find(moderationQuery(filter))
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("author", "displayName profile email")
    .populate("reports.by", "displayName")
    .populate("post", "title text")
    .lean();
};

export const moderatePost = async (id: string, status: CommunityStatus, reason: string, userId: unknown) => {
  if (!isValidObjectId(id)) return null;
  return await postModel
    .findByIdAndUpdate(
      id,
      {
        status,
        moderation: { by: userId, at: new Date(), reason },
        // Remise en ligne : les signalements traités sont effacés
        ...(status === "publie" ? { reports: [] } : {}),
      },
      { new: true }
    )
    .lean();
};

export const moderateComment = async (id: string, status: CommunityStatus) => {
  if (!isValidObjectId(id)) return null;
  const comment = await commentModel
    .findByIdAndUpdate(id, { status, ...(status === "publie" ? { reports: [] } : {}) }, { new: true })
    .lean();
  if (comment) await recountComments(comment.post);
  return comment;
};

export const listMembersForModeration = async () => {
  const members = await memberModel.find().select("-password").sort({ createdAt: -1 }).lean();
  const counts = await postModel.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $group: { _id: "$author", count: { $sum: 1 } } },
  ]);
  const byMember = new Map(counts.map((row) => [String(row._id), row.count]));
  return members.map((member) => ({ ...member, postCount: byMember.get(String(member._id)) ?? 0 }));
};

export const setMemberSuspended = async (id: string, suspended: boolean) => {
  if (!isValidObjectId(id)) return null;
  return await memberModel.findByIdAndUpdate(id, { suspended }, { new: true }).select("-password").lean();
};

// ------------------------------------------------------------------
// Chiffres de la communauté (page d'accueil du réseau)
// ------------------------------------------------------------------

export const getCommunityStats = async () => {
  const [members, posts, comments, tags] = await Promise.all([
    memberModel.countDocuments({ suspended: false }),
    postModel.countDocuments({ status: "publie" }),
    commentModel.countDocuments({ status: "publie" }),
    postModel.aggregate<{ _id: string; count: number }>([
      { $match: { status: "publie" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 12 },
    ]),
  ]);

  const recentMembers = await memberModel
    .find({ suspended: false })
    .sort({ createdAt: -1 })
    .limit(6)
    .select(AUTHOR_FIELDS)
    .lean();

  return {
    members,
    posts,
    comments,
    tags: tags.map((tag) => ({ tag: tag._id, count: tag.count })),
    recentMembers: recentMembers.map(authorSummary),
  };
};
