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

