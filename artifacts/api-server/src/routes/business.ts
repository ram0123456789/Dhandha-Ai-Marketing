import { Router, type IRouter } from "express";
import { AuditBusinessBody, GetSeoKeywordsBody, AnalyzeCompetitorsBody } from "@workspace/api-zod";
import { computeBusinessAudit, generateKeywords, generateCompetitorAnalysis } from "../lib/ai";
import { db, activityTable, postsTable } from "@workspace/db";
import { count, desc } from "drizzle-orm";

const router: IRouter = Router();

router.post("/business/audit", async (req, res): Promise<void> => {
  const parsed = AuditBusinessBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = computeBusinessAudit(parsed.data);

  await db.insert(activityTable).values({
    type: "Business Audit",
    description: `Audit run for "${parsed.data.businessName}" in ${parsed.data.city} — Score: ${result.score}/100`,
  }).catch(() => {});

  res.json(result);
});

router.post("/business/keywords", async (req, res): Promise<void> => {
  const parsed = GetSeoKeywordsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = generateKeywords(parsed.data);

  await db.insert(activityTable).values({
    type: "SEO Keywords",
    description: `Keywords generated for "${parsed.data.businessName}" in ${parsed.data.city}`,
  }).catch(() => {});

  res.json(result);
});

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [postsResult] = await db.select({ count: count() }).from(postsTable);
  const recentActivity = await db
    .select()
    .from(activityTable)
    .orderBy(desc(activityTable.createdAt))
    .limit(10);

  const activity = recentActivity.filter((a) =>
    ["Image Generated", "Festive Image"].includes(a.type)
  );
  const captions = recentActivity.filter((a) => a.type === "Caption Generated");
  const audits = recentActivity.filter((a) => a.type === "Business Audit");
  const replies = recentActivity.filter((a) => a.type === "Review Reply");

  res.json({
    totalPosts: postsResult?.count ?? 0,
    imagesGenerated: activity.length,
    captionsGenerated: captions.length,
    auditsRun: audits.length,
    repliesGenerated: replies.length,
    recentActivity: recentActivity.map((a) => ({
      type: a.type,
      description: a.description,
      time: a.createdAt.toISOString(),
    })),
  });
});

export default router;
