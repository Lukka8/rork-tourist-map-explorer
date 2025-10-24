import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import db from "@/backend/db/connection";

export const addFavoriteProcedure = protectedProcedure
  .input(z.object({ attractionId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const { attractionId } = input;
    const userId = ctx.user.id;

    try {
      await db.execute(
        "INSERT INTO favorites (user_id, attraction_id) VALUES (?, ?)",
        [userId, attractionId]
      );
      return { success: true };
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        return { success: true };
      }
      throw new Error("Failed to add favorite");
    }
  });
