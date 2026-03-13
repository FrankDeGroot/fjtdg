import { app } from "@azure/functions";
import bossHandler from "./boss/index.js";
import helloHandler from "./hello/index.js";
app.http("boss", {
    route: "boss",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: bossHandler
});
app.http("hello", {
    route: "hello",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: helloHandler
});
