import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { validatePassword } from '../../../../db/models/user';
import { signToken } from '../../../../lib/jwt';
import { TRPCError } from '@trpc/server';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const loginProcedure = publicProcedure
  .input(loginSchema)
  .mutation(async ({ input }) => {
    const user = await validatePassword(input.username, input.password);

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid username or password',
      });
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
    });

    return {
      user,
      token,
    };
  });
