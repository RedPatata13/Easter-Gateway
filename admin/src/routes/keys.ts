import { FastifyInstance } from 'fastify'
import { randomBytes } from 'crypto'
import { redis } from '../redis'
import { ApiKey } from '../types'

export const keysRouter = async (app: FastifyInstance): Promise<void> => {
  app.get('/keys', async () => {
    const data = await redis.hgetall('gateway:keys')
    if (!data) return []
    return Object.values(data).map(v => JSON.parse(v))
  })

  app.post('/keys', async (req, reply) => {
    const { name } = req.body as { name: string }

    if (!name) {
      return reply.code(400).send({ error: 'name is required' })
    }

    const key: ApiKey = {
      id: randomBytes(8).toString('hex'),
      name,
      key: `key_${randomBytes(16).toString('hex')}`,
      active: true,
      createdAt: new Date().toISOString()
    }

    await redis.hset('gateway:keys', key.key, JSON.stringify(key))
    return reply.code(201).send(key)
  })

  app.patch('/keys/:key', async (req, reply) => {
    const { key } = req.params as { key: string }
    const { active } = req.body as { active: boolean }

    const data = await redis.hget('gateway:keys', key)
    if (!data) return reply.code(404).send({ error: 'key not found' })

    const keyData: ApiKey = { ...JSON.parse(data), active }
    await redis.hset('gateway:keys', key, JSON.stringify(keyData))
    return keyData
  })

  app.delete('/keys/:keyValue', async (req, reply) => {
    const { keyValue } = req.params as { keyValue: string }
    console.log('attempting to delete:', keyValue)
    const deleted = await redis.hdel('gateway:keys', keyValue)
    if (!deleted) return reply.code(404).send({ error: 'key not found' })
    return reply.code(204).send()
  })
}