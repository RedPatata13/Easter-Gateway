# api-gateway

A horizontally scalable API Gateway built from scratch with Node.js and TypeScript. Inspired by AWS API Gateway — supports route matching, API key and JWT authentication, per-key rate limiting, and structured request logging. All instances are stateless, sharing state through Redis, and sit behind an nginx load balancer.

Built as a portfolio project to demonstrate systems design and backend engineering fundamentals.

---

## Features

- **Reverse proxy** — route incoming requests to upstream services by method and path
- **Authentication** — API key and JWT validation on every request
- **Rate limiting** — Redis-backed sliding window limiter, accurate across all instances
- **Request logging** — structured JSON logs via pino with trace IDs per request
- **Admin dashboard** — React UI to manage routes, API keys, and rate limit configs
- **Horizontal scaling** — stateless gateway instances behind nginx, scale with a single command

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

Each gateway instance is completely stateless. Redis is the single source of truth for all shared data, which means adding more instances requires no configuration changes — just scale up.

### Request lifecycle

```
Incoming request
  → logger (assign trace ID)
  → auth (validate API key or JWT)
  → rate limiter (sliding window check against Redis)
  → router (match path + method → upstream URL)
  → proxy (forward request, strip/add headers)
  → logger (record response status and latency)
```

---

## Tech stack

| Concern | Tool |
|---|---|
| Runtime | Node.js 20 |
| Language | TypeScript |
| HTTP server | Fastify |
| Shared state | Redis 7 + ioredis |
| Load balancer | nginx |
| Logging | pino |
| Containers | Docker + Docker Compose |

---

## Getting started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

### Run locally

```bash
git clone https://github.com/RedPatata13/api-gateway.git
cd api-gateway

cp .env.example .env
# edit .env and fill in your secrets

docker compose up --build
```

The gateway will be available at `http://localhost:80`.

### Scale gateway instances

```bash
docker compose up --scale gateway=3
```

nginx automatically distributes traffic across all running instances.

### Useful commands

```bash
# view logs for a specific service
docker compose logs -f gateway

# check all running services
docker compose ps

# stop everything
docker compose down

# stop and remove volumes (clears Redis data)
docker compose down -v
```

---

## Project structure

```
api-gateway/
├── docker-compose.yml
├── .env.example
├── gateway/                  # core proxy process
│   ├── Dockerfile
│   └── src/
│       ├── main.ts           # server entry point
│       ├── router.ts         # route matching
│       ├── proxy.ts          # request forwarding
│       ├── config.ts         # loads config from Redis
│       └── middleware/
│           ├── auth.ts       # API key / JWT validation
│           ├── rateLimit.ts  # sliding window rate limiter
│           └── logger.ts     # structured request logging
├── admin/                    # admin UI + config API
│   └── src/
│       ├── api/              # CRUD for routes and keys
│       └── ui/               # React dashboard
├── nginx/
│   └── nginx.conf
└── redis/
    └── redis.conf
```

---

## Environment variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Description |
|---|---|
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret used to verify JWT tokens |
| `ADMIN_API_KEY` | Key required to access the admin API |
| `GATEWAY_PORT` | Port the gateway listens on (default: 3000) |
| `NODE_ENV` | `development` or `production` |

---

## Roadmap

- [x] Docker Compose setup with Redis and nginx
- [ ] Route matching and reverse proxy
- [ ] API key authentication
- [ ] JWT authentication
- [ ] Redis-backed rate limiting
- [ ] Structured request logging
- [ ] Admin REST API
- [ ] Admin React dashboard

---

## License

MIT