export function getClientPrincipal(req) {
  const clientPrincipal = req.headers['x-ms-client-principal'];
  if (!clientPrincipal) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(clientPrincipal, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

export function withRequiredRole(role, handler) {
  return async function (context, req) {
    const principal = getClientPrincipal(req);
    if (!principal) {
      context.res = { status: 401, body: 'Not authenticated' };
      return;
    }

    const roles = principal.userRoles || [];
    if (!roles.includes(role)) {
      context.res = { status: 403, body: `Forbidden: missing required role '${role}'` };
      return;
    }

    return handler(context, req, principal);
  };
}
