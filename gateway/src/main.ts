import Fastify from 'fastify'
import { loadRoutes, seedKeys, seedRoutes } from './config'
import { proxyRequest } from './proxy'
import { authMiddleware } from './middleware/auth';

const app = Fastify({ logger: true });

app.addHook('onRequest', authMiddleware);

app.get('/health', async () => {
  return { status: 'ok' }
})

app.all('/*', async (req, reply) => {
  await proxyRequest(req, reply)
})

const start = async () => {
  await seedKeys()
  await seedRoutes()
  await loadRoutes()

  await app.listen({
    port: Number(process.env.GATEWAY_PORT) || 3000,
    host: '0.0.0.0'
  })
}

start()