# Database monitoring

Database monitoring is disabled by default. Enable it with `db: true` and pass
the client that should be checked.

Without a configured client, the response contains:

```json
{
  "db": false,
  "db_status": "unknown"
}
```

## Mongoose

```js
const mongoose = require("mongoose");

await mongoose.connect(process.env.MONGODB_URI);

app.use(
  healthCheck({
    db: true,
    mongoose,
  }),
);
```

Example fields:

```json
{
  "db_mongoose": true,
  "db_mongoose_status": "connected"
}
```

| `readyState` | Status |
| ---: | --- |
| `0` | `disconnected` |
| `1` | `connected` |
| `2` | `connecting` |
| `3` | `disconnecting` |

## Sequelize

```js
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASE_URL);

app.use(
  healthCheck({
    db: true,
    sequelize,
  }),
);
```

The middleware waits for `sequelize.authenticate()` before responding.

Successful authentication:

```json
{
  "db_sequelize": true,
  "db_sequelize_status": "connected"
}
```

Failed authentication:

```json
{
  "db_sequelize": false,
  "db_sequelize_status": "disconnected"
}
```

## IORedis

```js
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

app.use(
  healthCheck({
    db: true,
    ioredis: redis,
  }),
);
```

The check writes a timestamp to `HEALTH_CHECK`, sends `PING`, and records the
connection status and latency.

```json
{
  "db_ioredis": true,
  "db_ioredis_status": "ready",
  "db_ioredis_message": "Healthy",
  "db_ioredis_latency": "1ms",
  "db_ioredis_ping": "PONG"
}
```

## Multiple clients

```js
app.use(
  healthCheck({
    db: true,
    mongoose,
    sequelize,
    ioredis: redis,
  }),
);
```
