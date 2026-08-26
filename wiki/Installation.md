# Installation

## Install with Express 4

```bash
npm install express@4 @sparkit-gmbh/express-health-check
```

## Install with Express 5

```bash
npm install express@5 @sparkit-gmbh/express-health-check
```

## Node.js

Version 2 requires Node.js 24 or later:

```bash
nvm install 24
nvm use 24
```

The repository contains an `.nvmrc`, so contributors can also run `nvm use`.

## CommonJS import

The callable export is recommended:

```js
const healthCheck = require("@sparkit-gmbh/express-health-check");
app.use(healthCheck());
```

The named export remains supported:

```js
const {
  MiddlewareWrapper,
} = require("@sparkit-gmbh/express-health-check");

app.use(MiddlewareWrapper());
```
