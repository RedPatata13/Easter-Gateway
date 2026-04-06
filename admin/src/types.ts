export interface ApiKey {
    id: string;
    name: string;
    key: string;
    active: boolean;
    createdAt: string;
}

export interface Route {
    id: string;
    path: string;
    method: string;
    upstream : string;
    stripPath: boolean;
}