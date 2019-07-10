# express-api-monitor
A simple middleware that returns the availability of the API and related services.

# Getting started

Install with:
```
npm install --save @4dims/express-status-monitor
```

Use it in your express app:
```
const app = require('express')();
const statusMonitor = require('@4dims/express-status-monitor');

// Default
app.use(statusMonitor());

// With DB Monitor (Mongoose / Sequelize)

// With Custom URL Path
app.use(status({ path: '/api/status', db: true }));

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
    res.send('hello world');
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
```

# Options
### Custom URL Path
```
{ path: '/status'}
```

### API Monitoring: Enable/Disable
```
{ api: true }
```

### DB Monitoring: Enable/Disable
```
{ db: true }
```

If DB is set to `true`, a DB instance should be provided
- Mongoose `{ mongoose: mongoose }`
- Sequelize `{ sequelize: sequelize }`

#### DB Monitoring support
- [x] Mongoose ORM (MongoDB)
- [x] Sequelize ORM (MySQL, PostgreSQL, SQlite, ...)
- [ ] MongoDB (coming soon)

### Extras
You can return any JSON data with the extras property
```
{
    extras: {
        infoA: 1234
        infoB: 1234
        infoC: 'somethin'
    }
}
```

### Feedback
Suggestions or improvements are most welcomed ! Open an [issue](https://github.com/piraveen/express-status-monitor/issues) if you want to help.

### Author
Piraveen Kamalathas <https://github.com/piraveen>
