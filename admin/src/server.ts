import 'dotenv/config'
import Fastify from 'fastify'
import { keysRouter } from './routes/keys'
import { routesRouter } from './routes/routes'

const app = Fastify({ logger: true })

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-secret'

app.addHook('onRequest', async (req, reply) => {
  if (req.url === '/health') return

  const key = req.headers['x-admin-key'] as string
  if (key !== ADMIN_API_KEY) {
    reply.code(401).send({ error: 'unauthorized' })
  }
})

app.get('/health', async () => ({ status: 'ok' }))

app.register(keysRouter, { prefix: '/admin' })
app.register(routesRouter, { prefix: '/admin' })

const start = async () => {
  await app.listen({ port: 4000, host: '0.0.0.0' })
}

start()