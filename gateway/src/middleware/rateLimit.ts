import { FastifyRequest, FastifyReply } from "fastify";
import { redis } from "../config";
import { bypass } from "./bypass";

const WINDOW_MS = 60 * 1000;
const DEFAULT_LIMIT = 60;

const slidingWindow = `
    local key = KEYS[1];
    local now = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local limit = tonumber(ARGV[3])
    local id = ARGV[4]

    redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
    local count = redis.call('ZCARD', key)

    if count >= limit then
        return -1
    end

    redis.call('ZADD', key, now, id)
    redis.call('PEXPIRE', key, window)
    return count + 1
`

const getIdentifier = (req: FastifyRequest): string => {
    const apiKey = req.headers['x-api-key'] as string;
    if(apiKey) return `key:${apiKey}`

    const auth = req.headers['authorization'] as string;
    if (auth?.startsWith('Beader ')) return `jwt:${auth.slice(7, 20)}`;

    return `ip${req.ip}`;
}

export const rateLimitMiddleware = async (
    req: FastifyRequest,
    res: FastifyReply
) : Promise<void> => {
    if (bypass.some(path => req.url === path)) return;

    const identifier = getIdentifier(req);
    const key = `gateway:rl:${identifier}`;
    const now = Date.now();
    const id = `${now}-${Math.random()}`;

    const result = await redis.eval(
        slidingWindow,
        1,
        key,
        now,
        WINDOW_MS,
        DEFAULT_LIMIT,
        id
    ) as number;

    res.header('x-ratelimit-limit', DEFAULT_LIMIT);
    res.header('x-ratelimit-remaining', result === -1 ? 0 : DEFAULT_LIMIT - result);
    res.header('x-ratelimit-window', '60s');

    if(result === -1){
        res.code(429).send({
            error: 'rate limit exceeded',
            hint: 'slow down - max 60 requests per 60 seconds'
        });
    }
}