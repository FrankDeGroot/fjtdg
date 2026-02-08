import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/', (c) => c.text('Hello from Hono!'))

serve({
  fetch: app.fetch,
  port: 3000,
})

console.log('Server running on http://localhost:3000')
