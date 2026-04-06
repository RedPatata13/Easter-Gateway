import { FastifyRequest, FastifyReply } from 'fastify'
import { randomBytes } from 'crypto'

export const loggerMiddleware = async (
  req: FastifyRequest,
  _reply: FastifyReply
): Promise<void> => {
  req.traceId = randomBytes(8).toString('hex')
  req.startTime = Date.now()

  req.log.info({
    traceId: req.traceId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  }, 'incoming request')
}

export const loggerResponseHook = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const duration = Date.now() - req.startTime

  req.log.info({
    traceId: req.traceId,
    method: req.method,
    url: req.url,
    status: reply.statusCode,
    duration: `${duration}ms`,
    ip: req.ip
  }, 'request completed')
}