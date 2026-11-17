import express, { NextFunction, Response } from "express";
import { z } from "zod";
import { optionalMember, requireMember } from "../middlewares/memberAuth";
import requireRole from "../middlewares/requireRole";
import { communityUpload } from "../middlewares/upload";
import validateJWT from "../middlewares/validateJWT";
import {
  addComment,
  createPost,
  deleteOwnComment,
  deleteOwnPost,
  getCommunityStats,
  getMe,
  getMemberProfile,
  getPost,
  listComments,
  listCommentsForModeration,
  listMembersForModeration,
  listPosts,
  listPostsForModeration,
  loginMember,
  ModerationFilter,
  moderateComment,
  moderatePost,
  registerMember,
  reportContent,
  setMemberSuspended,
  toggleLike,
  updateMe,
} from "../services/communityService";
import { COMMUNITY_STATUSES, MEMBER_PROFILES, POST_KINDS } from "../types/common";
import { ExtendRequest } from "../types/extendedRequest";

const router = express.Router();

// Enveloppe commune : erreurs 500 homogènes
type Handler = (req: ExtendRequest, res: Response, next: NextFunction) => Promise<void>;
const handle =
  (fn: Handler) =>
  async (req: ExtendRequest, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.status(500).send({ message: "Something went wrong!" });
    }
  };

const firstIssue = (error: z.ZodError) => error.issues[0]?.message ?? "Invalid body";
const viewerId = (req: ExtendRequest) => (req.member ? String(req.member._id) : undefined);
const notFound = (res: Response) => res.status(404).send({ message: "Not found" });

// Les listes arrivent en multipart sous forme « a, b, c » ou en JSON sous forme de tableau
const tagList = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => (Array.isArray(value) ? value : (value ?? "").split(",")).map((tag) => tag.trim()).filter(Boolean));

// ------------------------------------------------------------------
// Comptes
// ------------------------------------------------------------------

const registerSchema = z.object({
  displayName: z.string().trim().min(2, "Nom trop court").max(60),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(200),
  profile: z.enum(MEMBER_PROFILES).default("passionne"),
  acceptCharter: z.literal(true, { errorMap: () => ({ message: "Merci d'accepter la charte" }) }),
});

router.post(
  "/register",
  handle(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send({ message: firstIssue(parsed.error) });
      return;
    }
    const { acceptCharter: _accepted, ...params } = parsed.data;
    const { statusCode, data } = await registerMember(params);
    res.status(statusCode).send(data);
  })
);

const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });

router.post(
  "/login",
  handle(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send({ message: "E-mail ou mot de passe incorrect." });
      return;
    }
    const { statusCode, data } = await loginMember(parsed.data.email, parsed.data.password);
    res.status(statusCode).send(data);
  })
);

router.get(
  "/me",
  requireMember,
  handle(async (req, res) => {
    res.send(getMe(req.member!));
  })
);

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  profile: z.enum(MEMBER_PROFILES).optional(),
  bio: z.string().trim().max(600).optional(),
  interests: z.array(z.string().trim().max(30)).max(8).optional(),
});

router.patch(
  "/me",
  requireMember,
  handle(async (req, res) => {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send({ message: firstIssue(parsed.error) });
      return;
    }
    res.send(await updateMe(req.member!, parsed.data));
  })
);

router.get(
  "/members/:id",
  optionalMember,
  handle(async (req, res) => {
    const profile = await getMemberProfile(req.params.id, viewerId(req));
    if (!profile) {
      notFound(res);
      return;
    }
    res.send(profile);
  })
);

router.get(
  "/stats",
  handle(async (_req, res) => {
    res.send(await getCommunityStats());
  })
);

// ------------------------------------------------------------------
// Publications et commentaires
// ------------------------------------------------------------------

router.get(
  "/posts",
  optionalMember,
  handle(async (req, res) => {
    const str = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);
    res.send(
      await listPosts(
        {
          kind: POST_KINDS.find((kind) => kind === req.query.kind),
          tag: str(req.query.tag),
          q: str(req.query.q),
          before: str(req.query.before),
          limit: Number(req.query.limit) || undefined,
        },
        viewerId(req)
      )
    );
  })
);

router.get(
  "/posts/:id",
  optionalMember,
  handle(async (req, res) => {
    const post = await getPost(req.params.id, viewerId(req));
    if (!post) {
      notFound(res);
      return;
    }
    res.send(post);
  })
);

const postSchema = z.object({
  kind: z.enum(POST_KINDS).default("discussion"),
  title: z.string().trim().max(140).optional(),
  text: z.string().trim().min(3, "Votre message est trop court").max(5000),
  tags: tagList,
  imageAlt: z.string().trim().max(200).optional(),
});

router.post(
  "/posts",
  requireMember,
  communityUpload.single("image"),
  handle(async (req, res) => {
    const parsed = postSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send({ message: firstIssue(parsed.error) });
      return;
    }
    res.status(201).send(await createPost(req.member!, parsed.data, req.file));
  })
);

router.delete(
  "/posts/:id",
  requireMember,
  handle(async (req, res) => {
    if (!(await deleteOwnPost(req.member!, req.params.id))) {
      notFound(res);
      return;
    }
    res.send({ deleted: true });
  })
);

router.post(
  "/posts/:id/like",
  requireMember,
  handle(async (req, res) => {
    const result = await toggleLike(req.member!, req.params.id);
    if (!result) {
      notFound(res);
      return;
    }
    res.send(result);
  })
);

router.get(
  "/posts/:id/comments",
  optionalMember,
  handle(async (req, res) => {
    const comments = await listComments(req.params.id, viewerId(req));
    if (!comments) {
      notFound(res);
      return;
    }
    res.send(comments);
  })
);

const commentSchema = z.object({ text: z.string().trim().min(1, "Commentaire vide").max(2000) });

router.post(
  "/posts/:id/comments",
  requireMember,
  handle(async (req, res) => {
    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send({ message: firstIssue(parsed.error) });
      return;
    }
    const comment = await addComment(req.member!, req.params.id, parsed.data.text);
    if (!comment) {
      notFound(res);
      return;
    }
    res.status(201).send(comment);
  })
);

router.delete(
  "/comments/:id",
  requireMember,
  handle(async (req, res) => {
    if (!(await deleteOwnComment(req.member!, req.params.id))) {
      notFound(res);
      return;
    }
    res.send({ deleted: true });
  })
);

const reportSchema = z.object({ reason: z.string().trim().min(3, "Précisez la raison").max(500) });

for (const kind of ["post", "comment"] as const) {
  router.post(
    `/${kind}s/:id/report`,
    requireMember,
    handle(async (req, res) => {
      const parsed = reportSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).send({ message: firstIssue(parsed.error) });
        return;
      }
      if (!(await reportContent(kind, req.member!, req.params.id, parsed.data.reason))) {
        notFound(res);
        return;
      }
      res.send({ reported: true });
    })
  );
}

// ------------------------------------------------------------------
// Modération (équipe du mémorial)
// ------------------------------------------------------------------

const team = [validateJWT, requireRole("admin", "moderateur")];
const filterOf = (value: unknown): ModerationFilter =>
  value === "hidden" || value === "all" ? value : "reported";

router.get(
  "/moderation/posts",
  ...team,
  handle(async (req, res) => {
    res.send(await listPostsForModeration(filterOf(req.query.filter)));
  })
);

router.get(
  "/moderation/comments",
  ...team,
  handle(async (req, res) => {
    res.send(await listCommentsForModeration(filterOf(req.query.filter)));
  })
);

const decisionSchema = z.object({
  status: z.enum(COMMUNITY_STATUSES),
  reason: z.string().trim().min(3, "Motif obligatoire").max(1000),
});

router.patch(
  "/moderation/posts/:id",
  ...team,
  handle(async (req, res) => {
    const parsed = decisionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send({ message: firstIssue(parsed.error) });
      return;
    }
    const post = await moderatePost(req.params.id, parsed.data.status, parsed.data.reason, req.user?._id);
    if (!post) {
      notFound(res);
      return;
    }
    res.send(post);
  })
);

router.patch(
  "/moderation/comments/:id",
  ...team,
  handle(async (req, res) => {
    const parsed = z.object({ status: z.enum(COMMUNITY_STATUSES) }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send({ message: firstIssue(parsed.error) });
      return;
    }
    const comment = await moderateComment(req.params.id, parsed.data.status);
    if (!comment) {
      notFound(res);
      return;
    }
    res.send(comment);
  })
);

router.get(
  "/moderation/members",
  ...team,
  handle(async (_req, res) => {
    res.send(await listMembersForModeration());
  })
);

router.patch(
  "/moderation/members/:id",
  ...team,
  handle(async (req, res) => {
    const parsed = z.object({ suspended: z.boolean() }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).send({ message: firstIssue(parsed.error) });
      return;
    }
    const member = await setMemberSuspended(req.params.id, parsed.data.suspended);
    if (!member) {
      notFound(res);
      return;
    }
    res.send(member);
  })
);

export default router;
