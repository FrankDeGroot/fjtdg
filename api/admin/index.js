module.exports = async function (context, req) {
  const clientPrincipal = req.headers['x-ms-client-principal'];
  if (!clientPrincipal) {
    // context.res = { status: 401, body: "Not authenticated" };
    context.res = {
      body: "(admin) Hello from Azure Function API!"
    };
    return;
  }
  const decoded = JSON.parse(Buffer.from(clientPrincipal, 'base64').toString('ascii'));
  context.res = { body: `(admin) Hello ${decoded.userDetails}, you logged in with ${decoded.identityProvider}` };
};
