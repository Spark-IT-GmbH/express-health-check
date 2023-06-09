"use strict";
const os = require("os");

/**
 * Mongoose connection Statuses
 */
const MONGOOSE_STATUS = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

/**
 * Default configuration
 */
const defaultConfig = {
  path: "/status",
  api: true,
  db: false,
  extras: {},
};

/**
 * Validates the user given configuration overrides
 * @param {Object} config
 */
const validateConfiguration = (config) => {
  if (!config) return defaultConfig;

  config.path =
    typeof config.path === "string" ? config.path : defaultConfig.path;
  config.extras =
    typeof config.extras === "object" ? config.extras : defaultConfig.extras;
  config.api = typeof config.api === "boolean" ? config.api : defaultConfig.api;
  config.db = typeof config.db === "boolean" ? config.db : defaultConfig.db;
  config.mongoose =
    typeof config.mongoose === "object" ? config.mongoose : null;
  config.sequelize =
    typeof config.sequelize === "object" ? config.sequelize : null;
  config.ioredis = typeof config.ioredis === "object" ? config.ioredis : null;
  return config;
};

/**
 * Build mongoose (mongodb) status
 * @param {Object} config
 * @param {Object} data Response object
 */
const getMongooseStatus = (config, data) => {
  if (config.mongoose && config.mongoose.connection) {
    const mongooseState = config.mongoose.connection.readyState;
    data.db_mongoose = mongooseState === 1;
    data.db_mongoose_status = MONGOOSE_STATUS[mongooseState];
    delete data.db;
    delete data.db_status;
  }
};

/**
 * Build sequelize (mysql/postgresql/sqlite) status
 * @param {Object} config
 * @param {Object} data Response object
 */
const getSequelizeStatus = (config, data) => {
  if (config.sequelize && config.sequelize.authenticate) {
    config.sequelize
      .authenticate()
      .then(function (err) {
        data.db_sequelize = true;
        data.db_sequelize_status = "connected";
      })
      .catch(function (err) {
        data.db_sequelize = false;
        data.db_sequelize_status = "disconnected";
      });

    delete data.db;
    delete data.db_status;
  }
};

/**
 * Build ioredis (redis) status
 * @param {Object} config
 * @param {Object} data Response object
 */
const getIORedisStatus = async (config, data) => {
  if (config.ioredis) {
    const startMs = new Date().getMilliseconds();

    data.db_ioredis_status = config.ioredis.status;

    try {
      await config.ioredis.set("HEALTH_CHECK", new Date().toISOString());

      data.db_ioredis_message = "Healthy";
      data.db_ioredis_latency = new Date().getMilliseconds() - startMs + "ms";
      data.db_ioredis_ping = await config.ioredis.ping();
      data.db_ioredis_status = config.ioredis.status;
    } catch (err) {
      data.db_ioredis_message = "UNHEALTHY";
      data.db_ioredis_status = config.ioredis.status;
      data.db_ioredis_latency = new Date().getMilliseconds() - startMs + "ms";
    }

    data.db_ioredis = true;

    delete data.db;
    delete data.db_status;
  }
};

const getMemorySize = (memoryUnit) => {
  let mem_in_kb = memoryUnit / 1024;
  let mem_in_mb = mem_in_kb / 1024;
  let mem_in_gb = mem_in_mb / 1024;

  mem_in_kb = Math.floor(mem_in_kb);
  mem_in_mb = Math.floor(mem_in_mb);
  mem_in_gb = Math.floor(mem_in_gb);

  mem_in_mb = mem_in_mb % 1024;
  mem_in_kb = mem_in_kb % 1024;

  return "Memory: " + mem_in_gb + "GB " + mem_in_mb + "MB " + mem_in_kb + "KB";
};

/**
 * Build system status info
 * @param {Object} config
 * @param {Object} data Response object
 */
const getSystemStatusInfo = (config, data) => {
  if (config.system) {
    const upTime = Math.fround(process.uptime() / 60).toFixed(2);
    const [load1min, load5mins, load15mins] = os.loadavg();

    data.system = {
      load1min,
      load5mins,
      load15mins,
      uptime:
        upTime > 60 ? `${Math.round(upTime / 60)} hour(s)` : `${upTime} min(s)`,
      totalmem: getMemorySize(os.totalmem()),
      freemem: getMemorySize(os.freemem()),
    };
  }
};

/**
 * Build output response based on user configuration
 * @param {Object} config
 * @returns {Promise}
 */
const buildResponse = (config) => {
  return new Promise(async (resolve) => {
    let data = Object.assign({ status: 200, health: "ok" }, config.extras);

    if (config.api) data.api = true;

    if (config.db) {
      data.db = false;
      data.db_status = "unknown";
      getMongooseStatus(config, data);
      getSequelizeStatus(config, data);
      await getIORedisStatus(config, data);
    }

    getSystemStatusInfo(config, data);

    return resolve(data);
  });
};

const MiddlewareWrapper = (config) => {
  const validatedConfig = validateConfiguration(config);
  const middleware = (req, res, next) => {
    if (req.path === validatedConfig.path) {
      buildResponse(validatedConfig).then((data) => {
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

module.exports = { MiddlewareWrapper };
