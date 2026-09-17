# Role-Based Dashboard

## Login credentials

Use `POST /api/v1/auth/email/login`.

| Role          | Email                          | Password    | Data scope  |
| ------------- | ------------------------------ | ----------- | ----------- |
| Admin         | `admin@dashboard.test`         | `Admin@123` | All regions |
| North Manager | `north.manager@dashboard.test` | `North@123` | North only  |
| South Manager | `south.manager@dashboard.test` | `South@123` | South only  |

Managers are scoped on the backend from the authenticated database user. If a
North Manager requests South or East data directly through curl/Postman, the API
must return `403 Forbidden` with a clear not-allowed message.

## Database

```bash
docker compose up -d postgres
cd backend
npm run migration:run
npm run seed:assessment
```

Postgres is published on host port `5436`.

## API

Login:

```http
POST /api/v1/auth/email/login
```

Mandatory widget endpoint:

```http
GET /api/v1/analytics/revenue-by-category?region=North
Authorization: Bearer <token>
```

Response:

```json
{
  "data": [{ "category": "Programming", "revenue": 12345 }],
  "meta": { "region": "North" }
}
```

For Admin, omit `region` to return all regions. For managers, omitting `region`
returns their own region. If a North Manager requests `region=South` or
`region=East`, the backend returns `403 Forbidden`.
