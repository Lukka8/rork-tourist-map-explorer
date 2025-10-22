import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { createVerificationCode, deleteOldVerificationCodes } from '../../../../db/models/verification';
import { TRPCError } from '@trpc/server';
import twilio from 'twilio';
import { findUserById } from '../../../../db/models/user';

const sendPhoneCodeSchema = z.object({
  userId: z.number(),
});

export const sendPhoneCodeProcedure = publicProcedure
  .input(sendPhoneCodeSchema)
  .mutation(async ({ input }) => {
    try {
      const user = await findUserById(input.userId);
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      await deleteOldVerificationCodes(input.userId, 'phone');
      const code = await createVerificationCode(input.userId, 'phone');

      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
      
      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
        console.warn('Twilio credentials not configured. Logging code to console instead.');
        console.log(`Phone verification code for user ${input.userId}: ${code}`);
        return {
          success: true,
          message: 'Verification code sent to phone (dev mode)',
        };
      }

      const client = twilio(twilioAccountSid, twilioAuthToken);
      
      await client.messages.create({
        body: `Your verification code is: ${code}. This code will expire in 15 minutes.`,
        from: twilioPhoneNumber,
        to: user.phone,
      });

      console.log(`Phone verification code sent to ${user.phone}`);

      return {
        success: true,
        message: 'Verification code sent to phone',
      };
    } catch (error) {
      console.error('Error sending phone verification code:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to send verification code',
      });
    }
  });
