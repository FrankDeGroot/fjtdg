<script>
  let id = 1;
  let cosmos = '';
  let sql = '';
  let me = '';

  async function callCosmosApi() {
    const res = await fetch(`/api/cosmos?id=${id}`);
    cosmos = await res.text();
  }

  async function callSqlApi() {
    const res = await fetch(`/api/sql?id=${id}`);
    sql = await res.text();
  }

  function login() {
    window.location.href = '/.auth/login/aad';
  }

  function logout() {
    window.location.href = '/.auth/logout';
  }

  async function getUser() {
    const res = await fetch('/.auth/me');
    const data = await res.json();
    me = JSON.stringify(data, null, 2);
  }
</script>

<main>
  <h1>fjtdg</h1>
  <div class="controls">
    <button on:click={callCosmosApi}>Call Cosomos API</button>
    <button on:click={callSqlApi}>Call SQL API</button>
    <button on:click={login}>Login</button>
    <button on:click={logout}>Logout</button>
    <button on:click={getUser}>Who am I?</button>
  </div>

  <label>
    ID
    <input type="number" bind:value={id} min="1" />
  </label>

  <section>
    <h2>Cosmos</h2>
    <pre>{cosmos}</pre>
  </section>

  <section>
    <h2>SQL</h2>
    <pre>{sql}</pre>
  </section>

  <section>
    <h2>User</h2>
    <pre>{me}</pre>
  </section>
</main>
