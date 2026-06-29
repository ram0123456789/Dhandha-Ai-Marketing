import { Router, type IRouter } from "express";
import { generateImageJob, pollImageStatus } from "../lib/pixazo";
import { GenerateImageBody, GetImageStatusParams } from "@workspace/api-zod";
import { db, activityTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/images/generate", async (req, res): Promise<void> => {
  const parsed = GenerateImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { prompt } = parsed.data;

  const job = await generateImageJob(prompt);

  await db.insert(activityTable).values({
    type: "Image Generated",
    description: `AI image generation started: "${prompt.slice(0, 60)}..."`,
  }).catch(() => {});

  res.json({ requestId: job.requestId, status: job.status, imageUrl: null });
});

router.get("/images/status/:requestId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.requestId) ? req.params.requestId[0] : req.params.requestId;

  if (!rawId) {
    res.status(400).json({ error: "Missing requestId" });
    return;
  }

  const status = await pollImageStatus(rawId);
  res.json(status);
});

export default router;
