import { protectedProcedure } from "@/backend/trpc/create-context";
import db from "@/backend/db/connection";

export const listVisitedProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user.id;

  const [rows] = await db.execute(
    "SELECT attraction_id, visited_at FROM visited WHERE user_id = ? ORDER BY visited_at DESC",
    [userId]
  );

  return { visited: rows as Array<{ attraction_id: string; visited_at: Date }> };
});
