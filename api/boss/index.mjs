import { withRequiredRole } from '../_shared/auth.mjs';
import sql from 'mssql';

let poolPromise;

function getPool() {
  if (!poolPromise) {
    const connectionString = process.env.SQL_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('Missing SQL_CONNECTION_STRING setting');
    }

    poolPromise = new sql.ConnectionPool(connectionString).connect();
  }

  return poolPromise;
}

export default withRequiredRole('admin', async function (context, req, principal) {
  const idRaw = req.query?.id;
  if (!idRaw) {
    context.res = { status: 400, body: "Missing required query parameter 'id'" };
    return;
  }

  const id = Number.parseInt(idRaw, 10);
  if (!Number.isInteger(id)) {
    context.res = { status: 400, body: "Query parameter 'id' must be an integer" };
    return;
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT name FROM dbo.todo WHERE id = @id');

    const names = result.recordset.map((row) => row.name);
    context.res = {
      status: 200,
      jsonBody: {
        requestedBy: principal.userDetails,
        id,
        names
      }
    };
  } catch (error) {
    context.log.error('Database query failed', error);
    context.res = { status: 500, body: `Database query failed ${error}` };
  }
});