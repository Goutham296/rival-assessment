# Rival Blog Platform

A production-ready full-stack blog platform built with NestJS, Next.js 15, PostgreSQL, and Prisma.

🔗 **[Live Demo](https://rival-blog.vercel.app)** | **[API](https://rival-blog-api.railway.app/api)**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 10, TypeScript (strict), Passport, JWT |
| Database | PostgreSQL + Prisma ORM |
| Frontend | Next.js 15 (App Router), TypeScript, TanStack Query |
| State | Zustand |
| Jobs | BullMQ + Redis |
| Logging | Pino (structured JSON) |
| Rate Limiting | `@nestjs/throttler` |
| Deployment | Vercel (frontend) + Railway (backend) + Neon (DB) |

---

## Features

### Core
- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Protected dashboard routes
- ✅ Blog CRUD with unique slug generation
- ✅ Public feed with pagination (infinite scroll)
- ✅ Public blog URLs by slug
- ✅ Like/unlike system (optimistic UI, DB unique constraint)
- ✅ Comment system with real-time UI updates

### Advanced (Bonus)
- ✅ **Async job processing** — BullMQ generates blog summaries on publish without blocking the HTTP response
- ✅ **Rate limiting** — `@nestjs/throttler` guards auth, feed, and blog endpoints (429 on violation)
- ✅ **Structured logging** — Pino with JSON output in production, pretty-printed in dev; request IDs redacted from logs

---

## Architecture

```
rival-assessment/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/         # JWT auth, guards, strategies, decorators
│   │   ├── blogs/        # Blog CRUD (private)
│   │   ├── public/       # Public feed + blog by slug
│   │   ├── likes/        # Like/unlike
│   │   ├── comments/     # Comment CRUD
│   │   ├── jobs/         # BullMQ processor (summary generation)
│   │   └── prisma/       # PrismaService (global module)
│   └── prisma/
│       └── schema.prisma
└── frontend/             # Next.js 15 App Router
    └── src/
        ├── app/          # Pages (feed, auth, dashboard, blog/[slug])
        ├── components/   # BlogCard, LikeButton, CommentSection, BlogEditor, Navbar
        ├── lib/
        │   ├── api/      # Axios instance + all API calls (abstraction layer)
        │   └── hooks/    # useAuth (Zustand store)
        └── types/        # Shared TypeScript types
```

### Key Design Decisions

**N+1 Prevention**: The public feed uses Prisma's `_count` aggregate in a single query alongside the blog data. No sequential per-row queries. Verified with Prisma query logging.

**Optimistic UI for Likes**: `LikeButton` updates count and state instantly before the API call completes, then syncs with the server response or rolls back on error.

**Non-blocking Job Queue**: When a blog is published, the HTTP response returns immediately. A BullMQ job is enqueued to generate a text summary asynchronously. Redis failure is caught and gracefully skipped — it never breaks the publish flow.

**Slug uniqueness**: Slugs are generated with `slugify` and made unique by appending a counter (`my-post`, `my-post-1`, etc.) until a free slug is found.

**Global Prisma Module**: `PrismaService` is marked `@Global()` so it's available in every module without re-importing. Single connection pool shared across the app.

**JWT + Refresh Token flow**: Access tokens expire in 7 days; refresh tokens in 30 days. The Axios interceptor transparently refreshes on 401 and retries the original request.

---

## Database Schema

```prisma
User    ─┬─< Blog ─┬─< Like    (unique userId+blogId)
          └─< Like  └─< Comment
          └─< Comment
```

Indexes:
- `Blog(userId)` — fast dashboard queries
- `Blog(isPublished, createdAt)` — optimized feed ordering
- `Like(blogId)` — count aggregation
- `Comment(blogId)`, `Comment(createdAt)` — sorted comment fetching

---

## Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL (or Neon/Supabase connection string)
- Redis (optional — for async jobs; app works without it)

### Backend

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

npm install
npx prisma generate
npx prisma migrate deploy   # or: npx prisma migrate dev

npm run start:dev
# API running at http://localhost:3001/api
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Set NEXT_PUBLIC_API_URL=http://localhost:3001/api

npm install
npm run dev
# App running at http://localhost:3000
```

---

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | JWT | Current user |
| POST | `/api/auth/refresh` | JWT | Refresh tokens |
| GET | `/api/blogs` | JWT | My blogs |
| POST | `/api/blogs` | JWT | Create blog |
| PATCH | `/api/blogs/:id` | JWT | Update blog |
| DELETE | `/api/blogs/:id` | JWT | Delete blog |
| GET | `/api/public/feed` | No | Paginated feed |
| GET | `/api/public/blogs/:slug` | No | Blog by slug |
| POST | `/api/blogs/:id/like` | JWT | Like |
| DELETE | `/api/blogs/:id/like` | JWT | Unlike |
| POST | `/api/blogs/:id/comments` | JWT | Add comment |
| GET | `/api/blogs/:id/comments` | No | Get comments |

---

## Tradeoffs Made

**Summary generation is extractive, not AI**: For a real product I'd call an LLM API (OpenAI/Claude) in the BullMQ worker. I kept it simple here to avoid API key requirements, but the async job structure is exactly what you'd plug an AI call into.

**No optimistic UI for comments**: Comments use React Query's `onMutate` for an optimistic insert, but I chose not to fake the full comment object ID — the real one replaces it on `onSuccess`. This is a deliberate choice over potential ID mismatch bugs.

**No WYSIWYG editor**: I used a textarea for content. In production I'd integrate Tiptap or Lexical, but it adds significant scope.

**In-process slug uniqueness**: The slug loop queries the DB per attempt. For extremely high write throughput, a better approach is using a DB sequence or a slug with a random suffix. At <10k blogs/day this is fine.

---

## How I'd Scale to 1M Users

### Immediate (0–100K users)
- Add a CDN (Cloudflare) in front of both frontend and API
- Enable PostgreSQL connection pooling with PgBouncer or Neon's built-in pooler
- Cache the public feed in Redis with a 30-second TTL — feed content changes slowly and the DB is not the right tool to absorb thousands of reads/second

### Medium scale (100K–1M users)
- **Read replicas**: Route all `GET /public/*` queries to a read replica; writes go to primary
- **Like count caching**: Store like counts in Redis and sync to DB every 30s via a job. This avoids a DB write on every like click
- **Comment pagination cursor-based**: Switch from offset pagination to cursor-based (`createdAt + id`) to avoid slow offset queries at depth
- **Rate limiting at the edge**: Move from in-process throttler to Cloudflare rate limiting or an API gateway (Kong/AWS API Gateway) to stop traffic before it hits the server

### Architecture at scale
- Separate the job worker into its own service/container, scaled independently
- Introduce a message broker (Kafka or SQS) for event-driven patterns (e.g., "blog published" event fans out to: summary generation, search indexing, notification emails)
- Full-text search with Elasticsearch or pgvector for blog discovery
- S3 + presigned URLs for image uploads in blog content
- Horizontal pod scaling with Kubernetes; stateless NestJS instances behind a load balancer

---

## What I'd Improve

1. **Full-text search** on the feed with ranked results
2. **Rich text editor** (Tiptap) with Markdown or HTML storage
3. **Email notifications** (Resend/SendGrid) on comments and likes via the job queue
4. **AI-powered summaries** via OpenAI API in the BullMQ worker
5. **Tag/category system** for blog discovery and filtering
6. **Author profile pages** with public blog listings
7. **Draft autosave** with debounced PATCH requests
8. **Unit + integration tests** with Jest and Supertest
# force redeploy
