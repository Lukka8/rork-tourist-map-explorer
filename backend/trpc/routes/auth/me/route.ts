import { publicProcedure } from '../../../create-context';
import { verifyToken } from '../../../../lib/jwt';
import { findUserByUsername } from '../../../../db/models/user';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const meSchema = z.object({
  token: z.string(),
});

export const meProcedure = publicProcedure
  .input(meSchema)
  .query(async ({ input }) => {
    try {
      const payload = verifyToken(input.token);
      const user = await findUserByUsername(payload.username);

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found',
        });
      }

      return { user };
    } catch {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      });
    }
  });
