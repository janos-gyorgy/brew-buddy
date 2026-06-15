// Shared Hono environment: `userId` is populated by authMiddleware and read by
// every data route to scope queries to the current user.
export type AppEnv = {
  Variables: {
    userId: string;
  };
};
