import React from "react";
// tRPC is not used in this project setup. This file exports safe no-ops to avoid type errors.
// If you decide to use tRPC later, replace this with a proper client wired to your backend router.

export const trpc = {} as unknown as {
  Provider?: React.ComponentType<{ children: React.ReactNode }>;
};

export const trpcClient = null as unknown as never;
