import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { registerProcedure } from "./routes/auth/register/route";
import { loginProcedure } from "./routes/auth/login/route";
import { meProcedure } from "./routes/auth/me/route";
import { sendEmailCodeProcedure } from "./routes/verification/send-email-code/route";
import { sendPhoneCodeProcedure } from "./routes/verification/send-phone-code/route";
import { verifyEmailProcedure } from "./routes/verification/verify-email/route";
import { verifyPhoneProcedure } from "./routes/verification/verify-phone/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    register: registerProcedure,
    login: loginProcedure,
    me: meProcedure,
  }),
  verification: createTRPCRouter({
    sendEmailCode: sendEmailCodeProcedure,
    sendPhoneCode: sendPhoneCodeProcedure,
    verifyEmail: verifyEmailProcedure,
    verifyPhone: verifyPhoneProcedure,
  }),
});

export type AppRouter = typeof appRouter;
