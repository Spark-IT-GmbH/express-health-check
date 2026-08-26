# TypeScript

The package includes declarations tested independently against Express 4 and
Express 5 types.

## Basic usage

```ts
import express = require("express");
import healthCheck = require("@sparkit-gmbh/express-health-check");

const app = express();
app.use(healthCheck({ path: "/health", system: true }));
```

## Typed configuration

```ts
const config: healthCheck.MiddlewareWrapperConfig = {
  path: "/health",
  api: true,
  db: false,
  system: true,
  extras: {
    service: "users-api",
  },
};

app.use(healthCheck(config));
```

## Typed middleware

```ts
const middleware: healthCheck.MiddlewareWrapperReturn = healthCheck();

app.use(middleware);
app.use(middleware.middleware);
app.use(middleware.getStatus);
```

## Named export

```ts
import {
  MiddlewareWrapper,
} from "@sparkit-gmbh/express-health-check";

app.use(MiddlewareWrapper());
```

The package also exposes structural `MongooseClient`, `SequelizeClient`, and
`IORedisClient` interfaces.
