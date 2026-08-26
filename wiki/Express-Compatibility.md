# Express compatibility

Version 2 supports Express 4 and Express 5 through this peer dependency:

```json
{
  "peerDependencies": {
    "express": ">=4 <6"
  }
}
```

The same middleware API works with both versions:

```js
const express = require("express");
const healthCheck = require("@sparkit-gmbh/express-health-check");

const app = express();
app.use(healthCheck());
app.listen(3000);
```

## Middleware chaining

```js
app.use(healthCheck({ path: "/health" }));

app.get("/", (request, response) => {
  response.send("Application route");
});
```

Requests that do not match `/health` continue to the next middleware.

## Error handling

Unexpected response failures are forwarded through `next(error)` and can be
handled by an Express error handler:

```js
app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ error: "Health check failed" });
});
```
