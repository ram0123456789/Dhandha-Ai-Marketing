import { Router, type IRouter } from "express";
import { AnalyzeCompetitorsBody } from "@workspace/api-zod";
import { generateCompetitorAnalysis } from "../lib/ai";
import { db, activityTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/competitors/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeCompetitorsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = generateCompetitorAnalysis(parsed.data);

  await db.insert(activityTable).values({
    type: "Competitor Analysis",
    description: `Analysis done for "${parsed.data.businessName}" in ${parsed.data.city}`,
  }).catch(() => {});

  res.json(result);
});

export default router;
