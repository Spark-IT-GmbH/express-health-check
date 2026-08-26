# Troubleshooting

## The endpoint returns 404

Confirm the configured path matches the requested path exactly. The default is
`/status`.

```js
app.use(healthCheck({ path: "/api/health" }));
```

## `healthCheck is not a function`

Use the callable CommonJS export:

```js
const healthCheck = require("@sparkit-gmbh/express-health-check");
```

For the named form, destructure `MiddlewareWrapper` instead.

## Express cannot be resolved

Express is a peer dependency:

```bash
npm install express
```

## Express types cannot be resolved

Install types matching the Express major used by the application:

```bash
npm install --save-dev @types/express@4
```

or:

```bash
npm install --save-dev @types/express@5
```

## Database status is unknown

Enable database checks and provide the appropriate client:

```js
app.use(healthCheck({ db: true, mongoose }));
```

## IORedis reports unhealthy

Confirm Redis is reachable, credentials are correct, and the connection permits
the `SET` and `PING` commands.

## System information is missing

Enable it explicitly with `healthCheck({ system: true })`.

## Wiki synchronization fails

In the GitHub repository settings, enable Wikis and create the initial Home
page once. Also ensure Actions are allowed read/write repository permissions.
