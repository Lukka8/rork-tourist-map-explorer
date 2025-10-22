import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { verifyCode } from '../../../../db/models/verification';
import { updatePhoneVerified } from '../../../../db/models/user';
import { TRPCError } from '@trpc/server';

const verifyPhoneSchema = z.object({
  userId: z.number(),
  code: z.string().length(6),
});

export const verifyPhoneProcedure = publicProcedure
  .input(verifyPhoneSchema)
  .mutation(async ({ input }) => {
    const isValid = await verifyCode(input.userId, 'phone', input.code);

    if (!isValid) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid or expired verification code',
      });
    }

    await updatePhoneVerified(input.userId);

    return {
      success: true,
      message: 'Phone verified successfully',
    };
  });
