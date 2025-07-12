// DEPRECATED: This API route is no longer in use.
// Request acceptance functionality has been migrated to the acceptRequest function in src/data/startup.ts
// using server functions with the pg library instead of API routes.

export default function handler() {
  throw new Error("This API route is deprecated. Use acceptRequest from src/data/startup.ts instead.");
}