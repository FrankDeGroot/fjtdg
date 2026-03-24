import { app } from "@azure/functions";

import sqlHandler from "./sql/index.js";
import cosmosHandler from "./cosmos/index.js";
import pubSubHandler from "./pubsub/index.js"

app.http("sql", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: sqlHandler
});

app.http("cosmos", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: cosmosHandler
});

app.http("pubsub", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: pubSubHandler
})