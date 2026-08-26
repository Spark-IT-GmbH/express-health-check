# Configuration

Pass an optional configuration object to the middleware factory:

```js
app.use(
  healthCheck({
    path: "/health",
    api: true,
    db: false,
    system: true,
    extras: {
      service: "users-api",
      version: "2.0.0",
    },
  }),
);
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `path` | `string` | `"/status"` | Health-check endpoint path |
| `api` | `boolean` | `true` | Include API availability |
| `db` | `boolean` | `false` | Enable database monitoring |
| `system` | `boolean` | `false` | Include system information |
| `extras` | `object` | `{}` | Add custom response fields |
| `mongoose` | `object` | — | Mongoose client |
| `sequelize` | `object` | — | Sequelize client |
| `ioredis` | `object` | — | IORedis client |

## Custom endpoint

```js
app.use(healthCheck({ path: "/api/health" }));
```

Requests to other paths continue to the next Express middleware.

## Disable API status

```js
app.use(healthCheck({ api: false }));
```

## Custom fields

```js
app.use(
  healthCheck({
    extras: {
      service: "payments-api",
      environment: process.env.NODE_ENV,
      release: "2.0.0",
    },
  }),
);
```

Avoid overriding reserved fields such as `status`, `health`, `api`, `system`,
or fields beginning with `db`.
