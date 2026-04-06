import 'dotenv/config';
import Fastify from 'fastify'
import { loadRoutes, seedKeys, seedRoutes } from './config'
import { proxyRequest } from './proxy'
import { authMiddleware } from './middleware/auth';
import { sign as jwt_sign } from "jsonwebtoken";
import { rateLimitMiddleware } from './middleware/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const app = Fastify({ logger: true });

app.addHook('onRequest', authMiddleware);
app.addHook('onRequest', rateLimitMiddleware);

app.get('/health', async () => {
  return { status: 'ok' }
})

app.post('/token', async (req, res) => {
  const { sub, name } = req.body as { sub: string; name: string };

  if(!sub || !name){
    return res.code(400).send({ error: 'sub and name are required' });
  }

  const token = jwt_sign(
    { sub, name },
    JWT_SECRET,
    { expiresIn: '1h'}
  )

  return { token };
})

app.all('/*', async (req, res) => {
  await proxyRequest(req, res)
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