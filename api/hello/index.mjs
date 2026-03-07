import { withRequiredRole } from '../_shared/auth.mjs';

export default withRequiredRole('authenticated', async function (context, req, principal) {
  context.res = { body: `Hello ${principal.userDetails}, you logged in with ${principal.identityProvider}` };
});
