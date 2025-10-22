import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { createVerificationCode, deleteOldVerificationCodes } from '../../../../db/models/verification';
import { TRPCError } from '@trpc/server';
import { Resend } from 'resend';
import { findUserById } from '../../../../db/models/user';

const sendEmailCodeSchema = z.object({
  userId: z.number(),
});

export const sendEmailCodeProcedure = publicProcedure
  .input(sendEmailCodeSchema)
  .mutation(async ({ input }) => {
    try {
      const user = await findUserById(input.userId);
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      await deleteOldVerificationCodes(input.userId, 'email');
      const code = await createVerificationCode(input.userId, 'email');

      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (!resendApiKey) {
        console.warn('RESEND_API_KEY not configured. Logging code to console instead.');
        console.log(`Email verification code for user ${input.userId}: ${code}`);
        return {
          success: true,
          message: 'Verification code sent to email (dev mode)',
        };
      }

      const resend = new Resend(resendApiKey);
      
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: user.email,
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Hello ${user.firstname},</p>
            <p>Your verification code is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      });

      console.log(`Email verification code sent to ${user.email}`);

      return {
        success: true,
        message: 'Verification code sent to email',
      };
    } catch (error) {
      console.error('Error sending email verification code:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to send verification code',
      });
    }
  });
