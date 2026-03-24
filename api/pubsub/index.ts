import { withRequiredRole } from "../_shared/auth.js";
import type { HttpResponseInit } from "@azure/functions";
import { WebPubSubServiceClient } from "@azure/web-pubsub";

let client: WebPubSubServiceClient | undefined;

function getClient(): WebPubSubServiceClient {
	if (client) {
		return client;
	}

	const connectionString = process.env.WEB_PUBSUB_CONNECTION_STRING;
	const hub = process.env.WEB_PUBSUB_HUB || "chat";

	if (!connectionString) {
		throw new Error("Missing WEB_PUBSUB_CONNECTION_STRING setting");
	}

	client = new WebPubSubServiceClient(connectionString, hub);
	return client;
}

export default withRequiredRole("admin", async function (request, context, principal): Promise<HttpResponseInit> {
	const method = request.method.toUpperCase();

	try {
		const pubSubClient = getClient();
		switch (method) {
			case "GET": {
				const token = await pubSubClient.getClientAccessToken({
					userId: principal.userDetails ?? "unknown"
				});
				return {
					status: 200,
					jsonBody: {
						requestedBy: principal.userDetails,
						hub: process.env.WEB_PUBSUB_HUB || "chat",
						url: token.url
					}
				};
			}

			case "POST": {
				const message = request.query.get("message") || "hello from azure function";
				await pubSubClient.sendToAll({
					from: principal.userDetails ?? "unknown",
					message,
					sentAt: new Date().toISOString()
				});
				return {
					status: 200,
					jsonBody: {
						requestedBy: principal.userDetails,
						hub: process.env.WEB_PUBSUB_HUB || "chat",
						message
					}
				};
			}

			default:
				return {
					status: 405,
					headers: { Allow: "GET, POST" },
					jsonBody: {
						error: "Method not allowed. Use GET or POST."
					}
				};
		}
	} catch (error) {
		client = undefined;
		context.error("Web PubSub operation failed", error);
		return {
			status: 500,
			jsonBody: { error: `Web PubSub operation failed ${error}` }
		};
	}
});