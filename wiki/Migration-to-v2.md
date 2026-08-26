# Migrating to version 2

Version 2 modernizes the runtime, exports, declarations, and Express support.

## Breaking changes

### Node.js 24 is required

```bash
nvm install 24
nvm use 24
```

### Express is a peer dependency

Install the desired Express major in the consuming application:

```bash
npm install express@4
```

or:

```bash
npm install express@5
```

## Recommended import

```js
const healthCheck = require("@sparkit-gmbh/express-health-check");
app.use(healthCheck());
```

The named `MiddlewareWrapper` export remains available for compatibility.

## TypeScript changes

Version 2 provides complete option types, database client interfaces, helper
property types, and compatibility checks for Express 4 and Express 5.

## Asynchronous checks

Sequelize authentication is awaited before the response is sent, ensuring its
status is present reliably.
