import { Router, type IRouter } from "express";
import { GenerateReviewReplyBody } from "@workspace/api-zod";
import { generateReviewReply } from "../lib/ai";
import { db, activityTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/reviews/reply", async (req, res): Promise<void> => {
  const parsed = GenerateReviewReplyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const reply = generateReviewReply(parsed.data);

  await db.insert(activityTable).values({
    type: "Review Reply",
    description: `Reply generated for ${parsed.data.businessName} — ${parsed.data.rating} star review`,
  }).catch(() => {});

  res.json({ reply });
});

export default router;
