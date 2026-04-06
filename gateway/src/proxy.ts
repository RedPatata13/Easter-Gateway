import { FastifyRequest, FastifyReply } from 'fastify'
import http from 'http'
import https from 'https'
import { URL } from 'url'
import { matchRoute } from './router'

export const proxyRequest = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const route = matchRoute(req)

  if (!route) {
    reply.code(404).send({ error: 'no route matched', path: req.url })
    return
  }

  const upstreamPath = route.stripPath
  ? req.url.replace('/api', '') || '/'
  : req.url

  const upstreamUrl = new URL(upstreamPath, route.upstream)
  const isHttps = upstreamUrl.protocol === 'https:'
  const transport = isHttps ? https : http

  return new Promise((resolve) => {
    const options = {
      hostname: upstreamUrl.hostname,
      port: upstreamUrl.port || (isHttps ? 443 : 80),
      path: upstreamUrl.pathname + upstreamUrl.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: upstreamUrl.hostname,
        'x-forwarded-for': req.ip,
        'x-forwarded-proto': 'http',
        'accept-encoding': 'identity'
      }
    }

    const proxyReq = transport.request(options, (proxyRes) => {
      reply.code(proxyRes.statusCode || 200)

      Object.entries(proxyRes.headers).forEach(([key, value]) => {
        if (value) reply.header(key, value as string)
      })

      proxyRes.pipe(reply.raw)
      proxyRes.on('end', resolve)
    })

    proxyReq.on('error', (err) => {
      req.log.error({ err }, 'upstream error')
      reply.code(502).send({ error: 'upstream error', detail: err.message })
      resolve()
    })

    if (req.body) {
      proxyReq.write(JSON.stringify(req.body))
    }

    proxyReq.end()
  })
}