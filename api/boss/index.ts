import { withRequiredRole } from "../_shared/auth.js";
import type { HttpResponseInit } from "@azure/functions";
import sql, { ConnectionPool } from "mssql";

let poolPromise: Promise<ConnectionPool> | undefined;

function getPool() {
  if (!poolPromise) {
    const connectionString = process.env.SQL_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("Missing SQL_CONNECTION_STRING setting");
    }

    poolPromise = new sql.ConnectionPool(connectionString).connect();
  }

  return poolPromise;
}

export default withRequiredRole("admin", async function (request, context, principal): Promise<HttpResponseInit> {
  const idRaw = request.query.get("id");
  if (!idRaw) {
    return { status: 400, jsonBody: { error: "Missing required query parameter 'id'" } };
  }

  const id = Number.parseInt(idRaw, 10);
  if (!Number.isInteger(id)) {
    return { status: 400, jsonBody: { error: "Query parameter 'id' must be an integer" } };
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT name FROM dbo.todo WHERE id = @id");

    const names = (result.recordset as Array<{ name: string }>).map((row) => row.name);
    return {
      status: 200,
      jsonBody: {
        requestedBy: principal.userDetails,
        id,
        names
      }
    };
  } catch (error) {
    context.error("Database query failed", error);
    return { status: 500, jsonBody: { error: `Database query failed ${error}` } };
  }
});
