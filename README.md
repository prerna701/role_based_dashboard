# Role-Based Dashboard

Full-stack take-home project for a role-based learning-platform dashboard.

The backend is built with NestJS, PostgreSQL, TypeORM migrations, JWT auth, and
database-backed region scoping. The frontend scaffold exists in `frontend/` and
can be completed after the backend.

## Prerequisites

- Node.js 18+ recommended
- npm 8+
- Docker Desktop
- Host port `5436` available for PostgreSQL

## Setup

Start Postgres:

```bash
docker compose up -d postgres
```

Install and prepare the backend:

```bash
cd backend
npm install
npm run migration:run
npm run seed:assessment
npm run start:dev
```

Backend runs on:

```text
http://localhost:3001
```

API prefix/version means routes start with:

```text
/api/v1
```

Frontend scaffold:

```bash
cd frontend
npm install
npm run dev
```

Postgres is published on host port `5436`. The assessment `.env` files are
committed intentionally so the project can run as-is.

## Login Credentials

Use `POST /api/v1/auth/email/login`.

| Role          | Email                          | Password    | Data scope  |
| ------------- | ------------------------------ | ----------- | ----------- |
| Admin         | `admin@dashboard.test`         | `Admin@123` | All regions |
| North Manager | `north.manager@dashboard.test` | `North@123` | North only  |
| South Manager | `south.manager@dashboard.test` | `South@123` | South only  |

## API

Login:

```http
POST /api/v1/auth/email/login
Content-Type: application/json

{
  "email": "admin@dashboard.test",
  "password": "Admin@123"
}
```

Dashboard endpoint:

```http
GET /api/v1/analytics/overview?region=North
Authorization: Bearer <token>
```

Mandatory widget endpoint:

```http
GET /api/v1/analytics/revenue-by-category?region=North
Authorization: Bearer <token>
```

Response:

```json
{
  "data": [{ "category": "Programming", "enrollments": 12, "revenue": 12345, "share": 35.2 }],
  "meta": { "region": "North" }
}
```

Extra insight endpoints:

```http
GET /api/v1/analytics/drop-off-by-course?page=1&limit=10&region=North
Authorization: Bearer <token>
```

```http
GET /api/v1/analytics/popular-courses?page=1&limit=10&region=North
Authorization: Bearer <token>
```

```http
GET /api/v1/analytics/monthly-revenue?page=1&limit=10&region=North
Authorization: Bearer <token>
```

```http
GET /api/v1/analytics/students?page=1&limit=10&search=Asha&region=North
Authorization: Bearer <token>
```

The students endpoint powers the `/students` frontend page. It returns each
student's public student ID, name, join date, enrolled courses, instructors,
fees, grades, ratings, and completion summary. Region is used only for backend
scope filtering and is intentionally not exposed in student detail rows.

The frontend dashboard signs in with the seeded role accounts from the role
switcher and calls these analytics endpoints with the returned JWT, so browser
Network tab inspection shows real backend traffic.

Paginated endpoints return:

```json
{
  "data": [],
  "meta": {
    "region": "North",
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}
```

## Role Scoping

Managers are scoped on the backend from the authenticated database user. The
frontend never decides what a user can see.

- Admin with no `region`: all regions.
- Admin with `region=North`, `South`, or `East`: that region.
- North Manager with no `region`: North only.
- South Manager with no `region`: South only.
- North Manager requesting `region=South` or `region=East`: `403 Forbidden`.
- South Manager requesting `region=North` or `region=East`: `403 Forbidden`.

This also holds for direct curl/Postman calls because every analytics endpoint
uses `RegionScopeService` before querying data.

## Data Model

The source JSON is normalized into:

- `regions`
- `students`
- `categories`
- `instructors`
- `courses`
- `enrollments`
- `enrollment_facts` view

Important modeling choices:

- `fee_paid` is stored on `enrollments`, not `courses`, because the same course
  can have different paid fees.
- `regions` is a table because the dataset includes East even though only North
  and South managers exist.
- Source IDs like `S1` and `C12` are stored as `external_id`; joins use database
  primary keys.
- Student names are not unique because duplicate names exist in the dataset.
- `enrollment_facts` centralizes the analytics join path so new widgets reuse
  the same region axis.

More detail is in `backend/src/database/DATABASE_PLAN.md`.

## Analytics Persistence

Analytics uses an `AnalyticsRepository` contract with a relational TypeORM
implementation. The implementation injects repositories for the learning
entities and uses TypeORM `QueryBuilder` for joins, aggregates, grouping, and
pagination. `AnalyticsService` resolves the authenticated user's region scope,
validates requested regions, and composes responses; it does not access the
database directly or use `DataSource.query`.

Pagination follows the same boundary:

- `PaginationQueryDto` validates `page` and `limit` at the HTTP boundary. The
  service calculates the offset and builds the API pagination metadata.
- The repository applies `limit` and `offset` to its QueryBuilder and returns
  the current page together with the total number of matching groups.
- The repository does not know about HTTP responses, users, or API metadata.
- The service does not build database queries or calculate aggregate totals.

## API Response Format

Successful responses use a common envelope:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {},
  "meta": {},
  "statusCode": 200,
  "timestamp": "2026-09-17T12:00:00.000Z",
  "path": "/api/v1/analytics/overview"
}
```

Errors use the same top-level fields with `success: false`, `data: null`, and an `error` object.
Validation errors return `422`, authentication and authorization errors return
the appropriate `401` or `403` status, and unexpected errors return a generic
`500` message without exposing internal exception details.

## Frontend Data Flow

`frontend/lib/analytics-api.ts` is the frontend data-access boundary. It is the
only source module that calls the backend, stores the login token, validates and
unwraps API responses, and maps backend fields into the dashboard data shape.
The dashboard renders no hardcoded analytics data: it shows a loading or error
state until the login and analytics requests succeed. `DashboardShell` owns UI
state such as the selected role, region, search, and filters; it consumes the
normalized `DashboardData` object and does not call `fetch` directly.
Presentational components render the data they receive and do not know the
backend response format.

## Tests

```bash
cd backend
npm test -- region-scope.service.spec.ts
npm test -- analytics.service.spec.ts
npm run build
```

The tests cover:

- Admin all-region access.
- Admin region filtering.
- Manager default own-region scope.
- North/South manager cross-region denial.
- Unknown region validation.
- Scoped analytics queries and paginated insight responses.

## Working With AI

AI helped draft the schema, seed flow, and scoped analytics query patterns. One
thing I had to catch and correct was access-control behavior: simply filtering in
the frontend or trusting a requested `region` query parameter would fail the
direct API-call requirement. The final backend resolves scope from the
authenticated database user first, then queries with that resolved scope.
