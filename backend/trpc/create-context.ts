import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { verifyToken } from "@/backend/lib/jwt";
import { findUserByUsername } from "@/backend/db/models/user";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing authentication token',
    });
  }

  const token = authHeader.substring(7);
  
  try {
    const payload = verifyToken(token);
    const user = await findUserByUsername(payload.username);

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not found',
      });
    }

    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  } catch {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
