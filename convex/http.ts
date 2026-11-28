import { httpRouter } from "convex/server";
import { clerkUsersWebhook } from "./users/webhook";

// HTTP routes, served from the deployment's .convex.site URL.
// Only routing lives here; each handler lives with its table.
const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: clerkUsersWebhook,
});

export default http;
