import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { registerProcedure } from "./routes/auth/register/route";
import { loginProcedure } from "./routes/auth/login/route";
import { meProcedure } from "./routes/auth/me/route";
import { sendEmailCodeProcedure } from "./routes/verification/send-email-code/route";
import { sendPhoneCodeProcedure } from "./routes/verification/send-phone-code/route";
import { verifyEmailProcedure } from "./routes/verification/verify-email/route";
import { verifyPhoneProcedure } from "./routes/verification/verify-phone/route";
import { addFavoriteProcedure } from "./routes/favorites/add/route";
import { removeFavoriteProcedure } from "./routes/favorites/remove/route";
import { listFavoritesProcedure } from "./routes/favorites/list/route";
import { addVisitedProcedure } from "./routes/visited/add/route";
import { listVisitedProcedure } from "./routes/visited/list/route";
import { addReviewProcedure } from "./routes/reviews/add/route";
import { listReviewsProcedure } from "./routes/reviews/list/route";

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
  favorites: createTRPCRouter({
    add: addFavoriteProcedure,
    remove: removeFavoriteProcedure,
    list: listFavoritesProcedure,
  }),
  visited: createTRPCRouter({
    add: addVisitedProcedure,
    list: listVisitedProcedure,
  }),
  reviews: createTRPCRouter({
    add: addReviewProcedure,
    list: listReviewsProcedure,
  }),
});

export type AppRouter = typeof appRouter;
