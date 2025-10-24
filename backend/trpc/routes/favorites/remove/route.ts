import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import db from "@/backend/db/connection";

export const removeFavoriteProcedure = protectedProcedure
  .input(z.object({ attractionId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const { attractionId } = input;
    const userId = ctx.user.id;

    await db.execute(
      "DELETE FROM favorites WHERE user_id = ? AND attraction_id = ?",
      [userId, attractionId]
    );

    return { success: true };
  });
