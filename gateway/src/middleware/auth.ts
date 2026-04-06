import { FastifyRequest, FastifyReply } from "fastify";
import { redis } from "../config";
import { JwtPayload, verify as jwt_verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const verifyApiKey = async (key: string) : Promise<boolean> => {
    const data = await redis.hget('gateway:keys', key);
    if(!data) return false;

    const keyData = JSON.parse(data);
    return keyData.active === true;
}

const verifyJwt = (token: string): JwtPayload | null => {
    try {
        const decoded = jwt_verify(token, JWT_SECRET);
        console.log("JWT Secret: ", JWT_SECRET);
        return decoded as JwtPayload;
    } catch {
        return null;
    }
}

export const authMiddleware = async (
    req: FastifyRequest,
    res: FastifyReply
): Promise<void> => {
    // if (req.url) === proces.env.}
    const bypass = ['/health', '/token'];
    if (bypass.includes(req.url)) return;
    console.log(req.url);

    const apiKey = req.headers['x-api-key'] as string;
    const authHeader = req.headers['authorization'] as string;
    if(apiKey){
        const valid = await verifyApiKey(apiKey);
        if(!valid) {
            res.code(403).send({ error: 'invalid or disabled api key' });
            return;
        }

        req.log.info('authenticated via api key');
        return;
    }

    if(authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const payload = verifyJwt(token);

        if(!payload){
            res.code(401).send({ error: 'invalid or expired token' });
            return;
        }

        req.log.info({ sub: payload.sub }, 'authenticated via jwt');
        return;
    }

    res.code(401).send({
        error: 'unauthorized',
        hint: 'provide x-api-key header or bearer token'
    });
}