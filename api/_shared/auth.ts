import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export type Principal = {
  userRoles?: string[];
  userDetails?: string;
  identityProvider?: string;
};

type Handler = (
  request: HttpRequest,
  context: InvocationContext,
  principal: Principal
) => Promise<HttpResponseInit> | HttpResponseInit;

export function getClientPrincipal(request: HttpRequest): Principal | null {
  const clientPrincipal = request.headers.get("x-ms-client-principal");
  if (!clientPrincipal) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(clientPrincipal, "base64").toString("utf8")) as Principal;
  } catch {
    return null;
  }
}

export function withRequiredRole(role: string, handler: Handler) {
  return async function (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const principal = getClientPrincipal(request);
    if (!principal) {
      return { status: 401, jsonBody: { error: "Not authenticated" } };
    }

    const roles = principal.userRoles || [];
    if (!roles.includes(role)) {
      return { status: 403, jsonBody: { error: `Forbidden: missing required role '${role}'` } };
    }

    return handler(request, context, principal);
  };
}
