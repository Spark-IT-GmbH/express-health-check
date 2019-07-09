'use strict';

/**
 * Mongoose connection Statuses
 */
const MONGOOSE_STATUS = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
};

/**
 * Default configuration
 */
const defaultConfig = {
    path: '/status',
    api: true,
    db: false,
    extras: {},
};

/**
 * Validates the user given configuration overrides
 * @param {Object} config
 */
const validateConfiguration = config => {
    if (!config) return defaultConfig;

    config.path = typeof config.path === 'string' ? config.path : defaultConfig.path;
    config.extras = typeof config.extras === 'object' ? config.extras : defaultConfig.extras;
    config.api = typeof config.api === 'boolean' ? config.api : defaultConfig.api;
    config.db = typeof config.db === 'boolean' ? config.db : defaultConfig.db;
    config.mongoose = typeof config.mongoose === 'object' ? config.mongoose : null;
    config.sequelize = typeof config.sequelize === 'object' ? config.sequelize : null;
    return config;
};

/**
 * Build output response based on user configuration
 * @param {Object} config
 * @returns {Promise}
 */
const buildResponse = config => {
    return new Promise(resolve =>{
        let data = Object.assign({ status: 200 }, config.extras);

        if (config.api) data.api = true;
        if (config.db) {
            data.db = false;
            data.db_status = 'unknown';
            if (config.mongoose && config.mongoose.connection) {
                const mongooseState = config.mongoose.connection.readyState;
                data.db = mongooseState === 1;
                data.db_status = MONGOOSE_STATUS[mongooseState];
                return resolve(data);
            }

            if (config.sequelize && config.sequelize.authenticate) {
                config.sequelize
                .authenticate()
                .then(function(err) {
                    data.db = true;
                    data.db_status = 'connected';
                    return resolve(data);
                })
                .catch(function (err) {
                    data.db = false;
                    data.db_status = 'disconnected';
                    return resolve(data);
                });
            }
        }

        return resolve(data);
    });
};

const MiddlewareWrapper = config => {
    const validatedConfig = validateConfiguration(config);
    const middleware = (req, res, next) => {
        if (req.path === validatedConfig.path) {
            buildResponse(validatedConfig).then(data => {
                res.send(data).end();
            });
        } else {
            next();
        }
    };

    middleware.middleware = middleware;
    middleware.getStatus = middleware;
    return middleware;
};


module.exports = MiddlewareWrapper;
