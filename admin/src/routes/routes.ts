import { FastifyInstance } from 'fastify'
import { randomBytes } from 'crypto'
import { redis } from '../redis'
import { Route } from '../types'

const publishRouteChange = async (): Promise<void> => {
  await redis.publish('gateway:routes:changed', 'update')
}

export const routesRouter = async (app: FastifyInstance): Promise<void> => {
  app.get('/routes', async () => {
    const data = await redis.get('gateway:routes')
    return data ? JSON.parse(data) : []
  })

  app.post('/routes', async (req, reply) => {
    const { path, method, upstream, stripPath } = req.body as Omit<Route, 'id'>

    if (!path || !method || !upstream) {
      return reply.code(400).send({ error: 'path, method and upstream are required' })
    }

    const data = await redis.get('gateway:routes')
    const routes: Route[] = data ? JSON.parse(data) : []

    const route: Route = {
      id: randomBytes(8).toString('hex'),
      path,
      method,
      upstream,
      stripPath: stripPath ?? false
    }

    routes.push(route)
    await redis.set('gateway:routes', JSON.stringify(routes))
    await publishRouteChange()
    return reply.code(201).send(route)
  })

  app.patch('/routes/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const updates = req.body as Partial<Route>

    const data = await redis.get('gateway:routes')
    const routes: Route[] = data ? JSON.parse(data) : []
    const index = routes.findIndex(r => r.id === id)

    if (index === -1) return reply.code(404).send({ error: 'route not found' })

    routes[index] = { ...routes[index], ...updates }
    await redis.set('gateway:routes', JSON.stringify(routes))
    await publishRouteChange()
    return routes[index]
  })

  app.delete('/routes/:id', async (req, reply) => {
    const { id } = req.params as { id: string }

    const data = await redis.get('gateway:routes')
    const routes: Route[] = data ? JSON.parse(data) : []
    const filtered = routes.filter(r => r.id !== id)

    if (filtered.length === routes.length) {
      return reply.code(404).send({ error: 'route not found' })
    }

    await redis.set('gateway:routes', JSON.stringify(filtered))
    await publishRouteChange()
    return reply.code(204).send()
  })
}