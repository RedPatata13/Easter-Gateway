import 'dotenv/config'
import Fastify from 'fastify'
import { keysRouter } from './routes/keys'
import { routesRouter } from './routes/routes'
import fastifyStatic from "@fastify/static"
import path from 'path'

const app = Fastify({ logger: true })

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-secret'

app.addHook('onRequest', async (req, reply) => {
  if (!req.url.startsWith('/admin')) return;

  const key = req.headers['x-admin-key'] as string
  if (key !== ADMIN_API_KEY) {
    reply.code(401).send({ error: 'unauthorized' })
  }
})

app.get('/health', async () => ({ status: 'ok' }))

app.register(keysRouter, { prefix: '/admin' })
app.register(routesRouter, { prefix: '/admin' })
app.register(fastifyStatic, {
  root: path.join(__dirname, '../ui/dist'),
  prefix: '/'
});

const start = async () => {
  await app.listen({ port: 4000, host: '0.0.0.0' })
}

start()