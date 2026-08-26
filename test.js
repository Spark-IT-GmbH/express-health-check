"use strict";

const assert = require("node:assert/strict");
const { once } = require("node:events");
const test = require("node:test");

const healthCheck = require("./index");

const runMiddleware = (config, path = "/status") =>
  new Promise((resolve, reject) => {
    const middleware = healthCheck(config);
    const response = {
      send(data) {
        resolve({ data, nextCalled: false });
        return this;
      },
    };

    middleware({ path }, response, (error) => {
      if (error) reject(error);
      else resolve({ nextCalled: true });
    });
  });

test("exports a callable factory and its backwards-compatible named export", () => {
  assert.equal(typeof healthCheck, "function");
  assert.equal(healthCheck.MiddlewareWrapper, healthCheck);

  const middleware = healthCheck();
  assert.equal(middleware.middleware, middleware);
  assert.equal(middleware.getStatus, middleware);
});

test("returns the default health response at /status", async () => {
  const result = await runMiddleware();
  assert.deepEqual(result.data, { status: 200, health: "ok", api: true });
});

test("passes requests for other paths to the next middleware", async () => {
  const result = await runMiddleware(undefined, "/other");
  assert.equal(result.nextCalled, true);
});

test("applies custom options and does not mutate the supplied config", async () => {
  const config = {
    path: "/health",
    api: false,
    extras: { release: "2026.08" },
  };
  const original = structuredClone(config);
  const result = await runMiddleware(config, "/health");

  assert.deepEqual(result.data, {
    status: 200,
    health: "ok",
    release: "2026.08",
  });
  assert.deepEqual(config, original);
});

test("falls back to defaults for invalid runtime configuration values", async () => {
  const result = await runMiddleware({
    path: 42,
    api: "yes",
    db: "yes",
    extras: null,
    mongoose: false,
    sequelize: false,
    ioredis: false,
  });

  assert.deepEqual(result.data, { status: 200, health: "ok", api: true });
});

test("reports an unknown database when no client is configured", async () => {
  const result = await runMiddleware({ db: true });

  assert.deepEqual(result.data, {
    status: 200,
    health: "ok",
    api: true,
    db: false,
    db_status: "unknown",
  });
});

test("reports mongoose connection state", async () => {
  const result = await runMiddleware({
    db: true,
    mongoose: { connection: { readyState: 1 } },
  });

  assert.equal(result.data.db_mongoose, true);
  assert.equal(result.data.db_mongoose_status, "connected");
  assert.equal("db" in result.data, false);
  assert.equal("db_status" in result.data, false);
});

test("reports non-connected mongoose states", async () => {
  const result = await runMiddleware({
    db: true,
    mongoose: { connection: { readyState: 2 } },
  });

  assert.equal(result.data.db_mongoose, false);
  assert.equal(result.data.db_mongoose_status, "connecting");
});

test("awaits and reports a successful sequelize authentication", async () => {
  let authenticated = false;
  const result = await runMiddleware({
    db: true,
    sequelize: {
      async authenticate() {
        await Promise.resolve();
        authenticated = true;
      },
    },
  });

  assert.equal(authenticated, true);
  assert.equal(result.data.db_sequelize, true);
  assert.equal(result.data.db_sequelize_status, "connected");
});

test("reports a failed sequelize authentication", async () => {
  const result = await runMiddleware({
    db: true,
    sequelize: {
      async authenticate() {
        throw new Error("database unavailable");
      },
    },
  });

  assert.equal(result.data.db_sequelize, false);
  assert.equal(result.data.db_sequelize_status, "disconnected");
});

test("reports a healthy ioredis connection", async () => {
  const result = await runMiddleware({
    db: true,
    ioredis: {
      status: "ready",
      async set(key, value) {
        assert.equal(key, "HEALTH_CHECK");
        assert.doesNotThrow(() => new Date(value));
      },
      async ping() {
        return "PONG";
      },
    },
  });

  assert.equal(result.data.db_ioredis, true);
  assert.equal(result.data.db_ioredis_message, "Healthy");
  assert.equal(result.data.db_ioredis_ping, "PONG");
  assert.equal(result.data.db_ioredis_status, "ready");
  assert.match(result.data.db_ioredis_latency, /^-?\d+ms$/);
});

test("reports an unhealthy ioredis operation", async () => {
  const result = await runMiddleware({
    db: true,
    ioredis: {
      status: "reconnecting",
      async set() {
        throw new Error("redis unavailable");
      },
      async ping() {
        return "PONG";
      },
    },
  });

  assert.equal(result.data.db_ioredis_message, "UNHEALTHY");
  assert.equal(result.data.db_ioredis_status, "reconnecting");
  assert.match(result.data.db_ioredis_latency, /^-?\d+ms$/);
});

test("includes system information", async (t) => {
  t.mock.method(process, "uptime", () => 120);
  const minutes = await runMiddleware({ system: true });
  assert.equal(minutes.data.system.uptime, "2.00 min(s)");
  assert.match(minutes.data.system.totalmem, /^Memory: \d+GB \d+MB \d+KB$/);
  assert.match(minutes.data.system.freemem, /^Memory: \d+GB \d+MB \d+KB$/);

  process.uptime.mock.mockImplementation(() => 7_200);
  const hours = await runMiddleware({ system: true });
  assert.equal(hours.data.system.uptime, "2 hour(s)");
});

test("forwards response failures to next", async () => {
  const expected = new Error("send failed");
  const middleware = healthCheck();

  const error = await new Promise((resolve) => {
    middleware(
      { path: "/status" },
      {
        send() {
          throw expected;
        },
      },
      resolve,
    );
  });

  assert.equal(error, expected);
});

for (const major of [4, 5]) {
  test(`serves health checks through Express ${major}`, async (t) => {
    const express = require(`express${major}`);
    const app = express();
    app.use(healthCheck({ path: "/health", extras: { express: major } }));
    app.get("/other", (request, response) => response.send("next route"));

    const server = app.listen(0);
    t.after(() => server.close());
    await once(server, "listening");
    const { port } = server.address();

    const healthResponse = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(healthResponse.status, 200);
    assert.deepEqual(await healthResponse.json(), {
      status: 200,
      health: "ok",
      express: major,
      api: true,
    });

    const nextResponse = await fetch(`http://127.0.0.1:${port}/other`);
    assert.equal(await nextResponse.text(), "next route");
  });
}
