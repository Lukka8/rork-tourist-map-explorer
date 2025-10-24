import { protectedProcedure } from "@/backend/trpc/create-context";
import db from "@/backend/db/connection";

export const listFavoritesProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user.id;

  const [rows] = await db.execute(
    "SELECT attraction_id, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );

  return { favorites: rows as Array<{ attraction_id: string; created_at: Date }> };
});
