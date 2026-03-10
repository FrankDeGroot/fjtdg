import { withRequiredRole } from "../_shared/auth.js";
import type { HttpResponseInit } from "@azure/functions";

export default withRequiredRole("authenticated", async function (_request, _context, principal): Promise<HttpResponseInit> {
  return {
    status: 200,
    body: `Hello ${principal.userDetails}, you logged in with ${principal.identityProvider}`
  };
});
