import { FastifyRequest } from 'fastify'
import { getRoutes } from './config'
import { Route as RouteType } from './types/index'

export const matchRoute = (req: FastifyRequest): RouteType | null => {
  const routes = getRoutes()
  const method = req.method.toUpperCase()
  const url = req.url

  for (const route of routes) {
    const methodMatch =
      route.method === 'ANY' || route.method.toUpperCase() === method

    const pathMatch = url.startsWith(route.path)

    if (methodMatch && pathMatch) {
      return route
    }
  }

  return null
}