import { Router, type IRouter } from "express";
import { db, alarmsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateAlarmBody,
  UpdateAlarmBody,
  UpdateAlarmParams,
  DeleteAlarmParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatAlarm(alarm: typeof alarmsTable.$inferSelect) {
  return {
    id: alarm.id,
    label: alarm.label,
    time: alarm.time,
    days: JSON.parse(alarm.days || "[]"),
    challengeType: alarm.challengeType,
    challengeDifficulty: alarm.challengeDifficulty,
    enabled: alarm.enabled,
    createdAt: alarm.createdAt.toISOString(),
  };
}

router.get("/alarms", async (_req, res) => {
  const alarms = await db.select().from(alarmsTable).orderBy(alarmsTable.createdAt);
  res.json(alarms.map(formatAlarm));
});

router.post("/alarms", async (req, res) => {
  const body = CreateAlarmBody.parse(req.body);
  const [alarm] = await db.insert(alarmsTable).values({
    label: body.label,
    time: body.time,
    days: JSON.stringify(body.days ?? []),
    challengeType: body.challengeType,
    challengeDifficulty: body.challengeDifficulty,
    enabled: body.enabled ?? true,
  }).returning();
  res.status(201).json(formatAlarm(alarm));
});

router.put("/alarms/:id", async (req, res) => {
  const { id } = UpdateAlarmParams.parse({ id: req.params.id });
  const body = UpdateAlarmBody.parse(req.body);

  const updateData: Partial<typeof alarmsTable.$inferInsert> = {};
  if (body.label !== undefined) updateData.label = body.label;
  if (body.time !== undefined) updateData.time = body.time;
  if (body.days !== undefined) updateData.days = JSON.stringify(body.days);
  if (body.challengeType !== undefined) updateData.challengeType = body.challengeType;
  if (body.challengeDifficulty !== undefined) updateData.challengeDifficulty = body.challengeDifficulty;
  if (body.enabled !== undefined) updateData.enabled = body.enabled;

  const [alarm] = await db.update(alarmsTable).set(updateData).where(eq(alarmsTable.id, id)).returning();
  res.json(formatAlarm(alarm));
});

router.delete("/alarms/:id", async (req, res) => {
  const { id } = DeleteAlarmParams.parse({ id: req.params.id });
  await db.delete(alarmsTable).where(eq(alarmsTable.id, id));
  res.json({ success: true });
});

export default router;
