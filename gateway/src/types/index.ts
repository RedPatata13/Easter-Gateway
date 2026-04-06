export interface Route {
    id: string;
    path: string;
    method: string | 'ANY';
    upstream: string;
    stripPath: boolean;
}

export interface GatewayRequest {
    routeId: string;
    traceId: string;
    upstream : string;
}

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    active: boolean;
    createdAt: string;
}

declare module 'fastify' {
    interface FastifyRequest {
        traceId: string;
        startTime: number
    }
}