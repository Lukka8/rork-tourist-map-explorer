import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { checkLinkProcedure, blockLinkProcedure, unblockLinkProcedure } from "./routes/moderation/links";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  moderation: createTRPCRouter({
    checkLink: checkLinkProcedure,
    blockLink: blockLinkProcedure,
    unblockLink: unblockLinkProcedure,
  }),
});

export type AppRouter = typeof appRouter;
