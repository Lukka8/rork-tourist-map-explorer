import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import db from "@/backend/db/connection";

export const listReviewsProcedure = publicProcedure
  .input(z.object({ attractionId: z.string() }))
  .query(async ({ input }) => {
    const { attractionId } = input;

    const [rows] = await db.execute(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
              u.firstname, u.lastname, u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.attraction_id = ?
       ORDER BY r.created_at DESC`,
      [attractionId]
    );

    return { reviews: rows };
  });
