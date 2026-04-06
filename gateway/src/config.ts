import Redis from 'ioredis';
import { Route } from './types/index';

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379')

let routes: Route[] = []

export const loadRoutes = async (): Promise<void> => {
  const data = await redis.get('gateway:routes')
  routes = data ? JSON.parse(data) : []
}

export const getRoutes = (): Route[] => routes

export const seedRoutes = async (): Promise<void> => {
  const seed: Route[] = [
    {
      id: '1',
      path: '/api/users',
      method: 'ANY',
      upstream: 'http://jsonplaceholder.typicode.com',
      stripPath: true
    },
    {
      id: '2',
      path: '/api/posts',
      method: 'GET',
      upstream: 'http://jsonplaceholder.typicode.com',
      stripPath: true
    }
  ]
  await redis.set('gateway:routes', JSON.stringify(seed))
  routes = seed
  console.log('seeded routes into Redis')
}

export { redis }