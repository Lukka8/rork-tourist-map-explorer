import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { createUser, findUserByUsername, findUserByEmail } from '../../../../db/models/user';
import { signToken } from '../../../../lib/jwt';
import { TRPCError } from '@trpc/server';

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  firstname: z.string().min(1).max(100),
  lastname: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  password: z.string().min(6),
});

export const registerProcedure = publicProcedure
  .input(registerSchema)
  .mutation(async ({ input }) => {
    const existingUsername = await findUserByUsername(input.username);
    if (existingUsername) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Username already exists',
      });
    }

    const existingEmail = await findUserByEmail(input.email);
    if (existingEmail) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Email already exists',
      });
    }

    const user = await createUser(input);

    const token = signToken({
      userId: user.id,
      username: user.username,
    });

    return {
      user,
      token,
    };
  });
