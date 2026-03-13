export function getClientPrincipal(request) {
    const clientPrincipal = request.headers.get("x-ms-client-principal");
    if (!clientPrincipal) {
        return null;
    }
    try {
        return JSON.parse(Buffer.from(clientPrincipal, "base64").toString("utf8"));
    }
    catch {
        return null;
    }
}
export function withRequiredRole(role, handler) {
    return async function (request, context) {
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
