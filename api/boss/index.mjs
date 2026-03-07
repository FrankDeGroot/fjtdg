import { withRequiredRole } from '../_shared/auth.mjs';

export default withRequiredRole('admin', async function (context, req, principal) {
  const roles = principal.userRoles || [];
  context.res = { body: `(boss) Hello ${principal.userDetails}, you logged in with ${principal.identityProvider} with roles ${roles}` };
});