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
