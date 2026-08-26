import express = require("express");
import healthCheck = require("../../../");
import { MiddlewareWrapper as namedHealthCheck } from "../../../";

const app = express();
const middleware = healthCheck({
  path: "/health",
  api: true,
  db: true,
  system: true,
  extras: { release: "2026.08" },
  mongoose: { connection: { readyState: 1 } },
  sequelize: { authenticate: async () => undefined },
  ioredis: {
    status: "ready",
    set: async () => "OK",
    ping: async () => "PONG",
  },
});

app.use(middleware);
app.use(middleware.middleware);
app.use(middleware.getStatus);
app.use(healthCheck.MiddlewareWrapper());
app.use(namedHealthCheck());

const config: healthCheck.MiddlewareWrapperConfig = { path: "/status" };
const typedMiddleware: healthCheck.MiddlewareWrapperReturn = healthCheck(config);
app.use(typedMiddleware);
