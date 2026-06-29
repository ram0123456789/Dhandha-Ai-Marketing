import { Router, type IRouter } from "express";
import { GenerateCaptionBody, GenerateFestiveImageBody } from "@workspace/api-zod";
import { generateCaptions, buildFestivePrompt } from "../lib/ai";
import { generateImageJob } from "../lib/pixazo";
import { db, activityTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/social/caption", async (req, res): Promise<void> => {
  const parsed = GenerateCaptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const captions = generateCaptions(parsed.data);

  await db.insert(activityTable).values({
    type: "Caption Generated",
    description: `Captions created for "${parsed.data.businessName}" — ${parsed.data.topic}`,
  }).catch(() => {});

  res.json({ captions });
});

router.post("/social/festive", async (req, res): Promise<void> => {
  const parsed = GenerateFestiveImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const prompt = buildFestivePrompt(parsed.data);
  const job = await generateImageJob(prompt);

  await db.insert(activityTable).values({
    type: "Festive Image",
    description: `${parsed.data.occasion} image started for "${parsed.data.businessName}"`,
  }).catch(() => {});

  res.json({ requestId: job.requestId, status: job.status, imageUrl: null });
});

export default router;
