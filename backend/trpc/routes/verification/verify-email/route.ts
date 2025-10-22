import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { verifyCode } from '../../../../db/models/verification';
import { updateEmailVerified } from '../../../../db/models/user';
import { TRPCError } from '@trpc/server';

const verifyEmailSchema = z.object({
  userId: z.number(),
  code: z.string().length(6),
});

export const verifyEmailProcedure = publicProcedure
  .input(verifyEmailSchema)
  .mutation(async ({ input }) => {
    const isValid = await verifyCode(input.userId, 'email', input.code);

    if (!isValid) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid or expired verification code',
      });
    }

    await updateEmailVerified(input.userId);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  });
