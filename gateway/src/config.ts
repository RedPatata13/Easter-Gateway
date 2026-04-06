import Redis from 'ioredis';
import { Route, ApiKey } from './types/index';

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

export const seedKeys = async (): Promise<void> => {
  const existing = await redis.hlen('gateway:keys');
  if(existing > 0) return;

  const keys: ApiKey[] = [
    {
      id: '1',
      name: 'test-app',
      key: 'key_test_123456',
      active: true,
      createdAt: new Date().toISOString()
    },

    {
      id: '2',
      name: 'disabled-app',
      key: 'key_disable_789',
      active: false,
      createdAt: new Date().toISOString()
    }
  ]

  for (const k of keys){
    await redis.hset('gateway:keys', k.key, JSON.stringify(k));
  }

  console.log('seeded api keys into redis');
}

export { redis }