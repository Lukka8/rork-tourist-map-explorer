import { z } from 'zod';
import { publicProcedure } from '../../create-context';

const blockedLinksMap = new Map<string, boolean>();

export const checkLinkProcedure = publicProcedure
  .input(
    z.object({
      url: z.string().url(),
    })
  )
  .query(async ({ input }: { input: { url: string } }) => {
    console.log('[checkLink] Checking URL:', input.url);
    const isBlocked = blockedLinksMap.has(input.url);
    return { blocked: isBlocked };
  });

export const blockLinkProcedure = publicProcedure
  .input(
    z.object({
      url: z.string().url(),
      reason: z.string(),
    })
  )
  .mutation(async ({ input }: { input: { url: string; reason: string } }) => {
    console.log('[blockLink] Blocking URL:', input.url);
    blockedLinksMap.set(input.url, true);
    return { success: true };
  });

export const unblockLinkProcedure = publicProcedure
  .input(
    z.object({
      url: z.string().url(),
    })
  )
  .mutation(async ({ input }: { input: { url: string } }) => {
    console.log('[unblockLink] Unblocking URL:', input.url);
    blockedLinksMap.delete(input.url);
    return { success: true };
  });
