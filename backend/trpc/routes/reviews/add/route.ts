import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import db from "@/backend/db/connection";

export const addReviewProcedure = protectedProcedure
  .input(
    z.object({
      attractionId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { attractionId, rating, comment } = input;
    const userId = ctx.user.id;

    await db.execute(
      `INSERT INTO reviews (user_id, attraction_id, rating, comment) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP`,
      [userId, attractionId, rating, comment || null, rating, comment || null]
    );

    return { success: true };
  });
