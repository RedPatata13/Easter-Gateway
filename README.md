---

# api-gateway

A horizontally scalable API Gateway built with Node.js and TypeScript. Inspired by AWS API Gateway, it supports dynamic route matching, API key and JWT authentication, distributed rate limiting, and structured request logging.

Designed as a deep dive into backend systems design, focusing on stateless services, shared infrastructure, and scalable request handling.

---

## Features

* **Reverse proxy** — route incoming requests to upstream services by method and path
* **Authentication** — API key and JWT validation on every request
* **Rate limiting** — Redis-backed sliding window limiter, consistent across instances
* **Request logging** — structured JSON logs via pino with per-request trace IDs
* **Admin dashboard** — React UI for managing routes, API keys, and rate limit configs
* **Horizontal scaling** — stateless gateway instances behind nginx

---

## Architecture

```
Client
  ↓
nginx (load balancer)
  ↓  round-robin
┌─────────────────────────────┐
│  gateway instance 1         │
│  gateway instance 2   ──────┼──→  upstream services
│  gateway instance N         │
└─────────────────────────────┘
  ↓
Redis (shared state)
  - API keys
  - Rate limit counters
  - Route definitions
```

Each gateway instance is stateless. Shared configuration and runtime data are stored in Redis, allowing new instances to be added without additional coordination.

---

### Request lifecycle

```
Incoming request
  → logger (assign trace ID)
  → auth (validate API key or JWT)
  → rate limiter (sliding window check via Redis)
  → router (match path + method → upstream URL)
  → proxy (forward request, adjust headers)
  → logger (record response status and latency)
```

---

## Tech stack

| Concern       | Tool                    |
| ------------- | ----------------------- |
| Runtime       | Node.js 20              |
| Language      | TypeScript              |
| HTTP server   | Fastify                 |
| Shared state  | Redis 7 + ioredis       |
| Load balancer | nginx                   |
| Logging       | pino                    |
| Containers    | Docker + Docker Compose |

---

## Getting started

### Prerequisites

* Docker
* Docker Compose

### Run locally

```bash
git clone https://github.com/RedPatata13/api-gateway.git
cd api-gateway

cp .env.example .env
# configure environment variables

docker compose up --build
```

Gateway will be available at `http://localhost:80`.

---

### Scale gateway instances

```bash
docker compose up --scale gateway=3
```

nginx distributes traffic automatically across instances.

---

### Useful commands

```bash
docker compose logs -f gateway
docker compose ps
docker compose down
docker compose down -v
```

---

## Project structure

```
api-gateway/
├── docker-compose.yml
├── .env.example
├── gateway/
│   ├── Dockerfile
│   └── src/
│       ├── main.ts
│       ├── router.ts
│       ├── proxy.ts
│       ├── config.ts
│       └── middleware/
│           ├── auth.ts
│           ├── rateLimit.ts
│           └── logger.ts
├── admin/
│   └── src/
│       ├── api/
│       └── ui/
├── nginx/
│   └── nginx.conf
└── redis/
    └── redis.conf
```

---

## Environment variables

| Variable        | Description                  |
| --------------- | ---------------------------- |
| `REDIS_URL`     | Redis connection string      |
| `JWT_SECRET`    | Secret for JWT verification  |
| `ADMIN_API_KEY` | Admin API access key         |
| `GATEWAY_PORT`  | Gateway port (default: 3000) |
| `NODE_ENV`      | Environment mode             |

---

## Roadmap

* [x] Docker Compose setup with Redis and nginx
* [x] Route matching and reverse proxy
* [x] API key authentication
* [x] JWT authentication
* [x] Redis-backed rate limiting
* [x] Structured request logging
* [x] Admin REST API
* [x] Admin React dashboard

---

## License

MIT

---