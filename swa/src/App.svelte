<script>
  let id = 1;
  let cosmos = '';
  let sql = '';
  let me = '';
  let pubsub = '';
  let pubsubPost = '';
  let outgoingMessage = 'hello from svelte';
  let wsState = 'disconnected';
  let wsMessages = '';

  let socket;

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

  function disconnectWebSocket() {
    if (socket) {
      socket.close();
      socket = undefined;
    }
    wsState = 'disconnected';
  }

  async function connectPubSub() {
    wsMessages = '';
    wsState = 'getting url';

    try {
      const res = await fetch('/api/pubsub');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Request failed with status ${res.status}`);
      }

      const url = data?.url;
      if (!url) {
        throw new Error('No WebSocket url returned by /api/pubsub');
      }

      pubsub = JSON.stringify(data, null, 2);

      disconnectWebSocket();
      wsState = 'connecting';
      socket = new WebSocket(url);

      socket.onopen = () => {
        wsState = 'connected';
      };

      socket.onmessage = (event) => {
        const line = typeof event.data === 'string' ? event.data : '[binary message]';
        wsMessages = wsMessages ? `${wsMessages}\n${line}` : line;
      };

      socket.onerror = () => {
        wsState = 'error';
      };

      socket.onclose = () => {
        if (wsState !== 'error') {
          wsState = 'disconnected';
        }
        socket = undefined;
      };
    } catch (error) {
      wsState = 'error';
      pubsub = String(error);
    }
  }

  async function sendPubSubMessage() {
    pubsubPost = 'sending...';

    try {
      const query = new URLSearchParams({ message: outgoingMessage });
      const res = await fetch(`/api/pubsub?${query.toString()}`, {
        method: 'POST'
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Request failed with status ${res.status}`);
      }

      pubsubPost = JSON.stringify(data, null, 2);
    } catch (error) {
      pubsubPost = String(error);
    }
  }
</script>

<main>
  <h1>fjtdg</h1>
  <div class="controls">
    <button on:click={callCosmosApi}>Call Cosmos API</button>
    <button on:click={callSqlApi}>Call SQL API</button>
    <button on:click={login}>Login</button>
    <button on:click={logout}>Logout</button>
    <button on:click={getUser}>Who am I?</button>
    <button on:click={connectPubSub}>Get PubSub URL and Connect</button>
    <button on:click={sendPubSubMessage}>Send PubSub Message</button>
    <button on:click={disconnectWebSocket}>Disconnect WebSocket</button>
  </div>

  <label>
    ID
    <input type="number" bind:value={id} min="1" />
  </label>

  <label>
    Message
    <input type="text" bind:value={outgoingMessage} placeholder="Type a message" />
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

  <section>
    <h2>PubSub</h2>
    <p>WebSocket status: {wsState}</p>
    <pre>{pubsub}</pre>
  </section>

  <section>
    <h2>WebSocket Messages</h2>
    <pre>{wsMessages}</pre>
  </section>

  <section>
    <h2>PubSub POST Result</h2>
    <pre>{pubsubPost}</pre>
  </section>
</main>
