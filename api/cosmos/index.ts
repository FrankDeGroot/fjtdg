import { withRequiredRole } from "../_shared/auth.js";
import type { HttpResponseInit } from "@azure/functions";
import { CosmosClient, type Container } from "@azure/cosmos";

let container: Container | undefined;

function getTodoContainer(): Container {
  if (container) {
    return container;
  }

  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  const databaseId = process.env.COSMOS_DATABASE_NAME;
  const containerId = process.env.COSMOS_CONTAINER_NAME || "todo";

  if (!endpoint || !key || !databaseId) {
    throw new Error("Missing Cosmos configuration. Set COSMOS_ENDPOINT, COSMOS_KEY, and COSMOS_DATABASE_NAME.");
  }

  const client = new CosmosClient({ endpoint, key });
  container = client.database(databaseId).container(containerId);
  return container;
}

export default withRequiredRole("admin", async function (request, context, principal): Promise<HttpResponseInit> {
  const id = request.query.get("id");
  if (!id) {
    return { status: 400, jsonBody: { error: "Missing required query parameter 'id'" } };
  }

  try {
    const todoContainer = getTodoContainer();
    const query = {
      query: "SELECT TOP 1 c.name FROM c WHERE c.id = @id",
      parameters: [{ name: "@id", value: id }]
    };

    const { resources } = await todoContainer.items.query<{ name?: string }>(query).fetchAll();
    const name = resources[0]?.name;

    if (!name) {
      return { status: 404, jsonBody: { error: `No todo item found with id '${id}'` } };
    }

    return {
      status: 200,
      jsonBody: {
        requestedBy: principal.userDetails,
        id,
        name
      }
    };
  } catch (error) {
    context.error("Cosmos query failed", error);
    return { status: 500, jsonBody: { error: `Cosmos query failed ${error}` } };
  }
});
