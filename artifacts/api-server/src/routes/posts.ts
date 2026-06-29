import { Router, type IRouter } from "express";
import { CreatePostBody, DeletePostParams } from "@workspace/api-zod";
import { db, postsTable, activityTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/posts", async (_req, res): Promise<void> => {
  const posts = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt));
  res.json(posts.map((p) => ({
    id: p.id,
    caption: p.caption,
    platform: p.platform,
    imageUrl: p.imageUrl ?? null,
    hashtags: p.hashtags ?? null,
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/posts", async (req, res): Promise<void> => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [post] = await db.insert(postsTable).values({
    caption: parsed.data.caption,
    platform: parsed.data.platform,
    imageUrl: parsed.data.imageUrl ?? null,
    hashtags: parsed.data.hashtags ?? null,
  }).returning();

  await db.insert(activityTable).values({
    type: "Post Saved",
    description: `Post saved for ${post.platform}: "${post.caption.slice(0, 60)}..."`,
  }).catch(() => {});

  res.status(201).json({
    id: post.id,
    caption: post.caption,
    platform: post.platform,
    imageUrl: post.imageUrl ?? null,
    hashtags: post.hashtags ?? null,
    createdAt: post.createdAt.toISOString(),
  });
});

router.delete("/posts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(postsTable).where(eq(postsTable.id, id));
  res.sendStatus(204);
});

export default router;
