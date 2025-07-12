// DEPRECATED: This API route is no longer in use.
// User requests functionality has been migrated to the getUserRequests function in src/data/startup.ts
// using server functions with the pg library instead of API routes.

export default function handler() {
  throw new Error("This API route is deprecated. Use getUserRequests from src/data/startup.ts instead.");
}