# Response format

## Default response

```json
{
  "status": 200,
  "health": "ok",
  "api": true
}
```

## Base fields

| Field | Type | Description |
| --- | --- | --- |
| `status` | `number` | Health response status value |
| `health` | `string` | General health label |
| `api` | `boolean` | API availability indicator |

## Optional fields

Database clients add fields such as:

- `db_mongoose` and `db_mongoose_status`
- `db_sequelize` and `db_sequelize_status`
- `db_ioredis`, `db_ioredis_status`, `db_ioredis_message`,
  `db_ioredis_latency`, and `db_ioredis_ping`

System monitoring adds the `system` object. Values supplied through `extras`
are copied into the response.

## HTTP status behavior

The middleware sends its result with Express `res.send()`. Dependency state is
reported in the response body, so monitoring consumers should inspect the
relevant database fields.
