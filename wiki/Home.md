# Express Health Check

`@sparkit-gmbh/express-health-check` is Express middleware that exposes a
health-check endpoint for an API and its related services.

It supports:

- Node.js 24 LTS
- Express.js 4 and 5
- JavaScript and TypeScript
- Mongoose, Sequelize, and IORedis
- System resource information
- Custom response metadata

## Installation

```bash
npm install express @sparkit-gmbh/express-health-check
```

## Quick start

```js
const express = require("express");
const healthCheck = require("@sparkit-gmbh/express-health-check");

const app = express();
app.use(healthCheck());

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
```

The default endpoint is `GET /status` and returns:

```json
{
  "status": 200,
  "health": "ok",
  "api": true
}
```

## Requirements

| Dependency | Supported versions |
| --- | --- |
| Node.js | `>=24.0.0` |
| Express.js | `>=4 <6` |

## Documentation

- [Installation](Installation)
- [Configuration](Configuration)
- [Database monitoring](Database-Monitoring)
- [System monitoring](System-Monitoring)
- [TypeScript](TypeScript)
- [Response format](Response-Format)
- [Express compatibility](Express-Compatibility)
- [Development](Development)
- [Migration to v2](Migration-to-v2)
- [Troubleshooting](Troubleshooting)
