import { FastifyRequest, FastifyReply } from "fastify";
import { redis } from "../config";

export const authMiddleware = async (
    req: FastifyRequest,
    res: FastifyReply
): Promise<void> => {
    // if (req.url) === proces.env.}
    if (req.url === '/health') return;

    const apiKey = req.headers['x-api-key'] as string;

    if(!apiKey){
        res.code(401).send({ error: 'missing api key', hint: 'provided x-api-key header'});
        return;
    }

    const data = await redis.hget('gateway:keys', apiKey);

    if(!data){
        res.code(403).send({ error: 'invalid api key' });
        return;
    }

    const keyData = JSON.parse(data);

    if(!keyData.active){
        res.code(403).send({ error: 'api key disabled' });
        return;
    }

    req.log.info({ keyId: keyData.id, name: keyData.name }, 'authenticated');
}