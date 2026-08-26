# System monitoring

Enable system information with:

```js
app.use(healthCheck({ system: true }));
```

Example response field:

```json
{
  "system": {
    "load1min": 1.21,
    "load5mins": 1.08,
    "load15mins": 0.95,
    "uptime": "2 hour(s)",
    "totalmem": "Memory: 16GB 0MB 0KB",
    "freemem": "Memory: 6GB 512MB 128KB"
  }
}
```

| Field | Description |
| --- | --- |
| `load1min` | Average system load over one minute |
| `load5mins` | Average system load over five minutes |
| `load15mins` | Average system load over fifteen minutes |
| `uptime` | Node.js process uptime |
| `totalmem` | Total system memory |
| `freemem` | Available system memory |

System values describe the host or container running the Node.js process.
