import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()
const port = Number.parseInt(process.env.PORT ?? '3000', 10)
const host = process.env.HOST ?? '0.0.0.0'

app.get('/', (c) => c.text('Hello from Hono!'))

serve({
  fetch: app.fetch,
  port,
  hostname: host,
})

console.log(`Server running on http://${host}:${port}`)
