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
  const overrides = config && typeof config === "object" ? config : {};

  return {
    ...overrides,
    path:
      typeof overrides.path === "string" ? overrides.path : defaultConfig.path,
    extras:
      overrides.extras && typeof overrides.extras === "object"
        ? overrides.extras
        : defaultConfig.extras,
    api:
      typeof overrides.api === "boolean" ? overrides.api : defaultConfig.api,
    db: typeof overrides.db === "boolean" ? overrides.db : defaultConfig.db,
    mongoose:
      overrides.mongoose && typeof overrides.mongoose === "object"
        ? overrides.mongoose
        : null,
    sequelize:
      overrides.sequelize && typeof overrides.sequelize === "object"
        ? overrides.sequelize
        : null,
    ioredis:
      overrides.ioredis && typeof overrides.ioredis === "object"
        ? overrides.ioredis
        : null,
  };
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
const getSequelizeStatus = async (config, data) => {
  if (config.sequelize && config.sequelize.authenticate) {
    try {
      await config.sequelize.authenticate();
      data.db_sequelize = true;
      data.db_sequelize_status = "connected";
    } catch (err) {
      data.db_sequelize = false;
      data.db_sequelize_status = "disconnected";
    }

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
const buildResponse = async (config) => {
  const data = Object.assign({ status: 200, health: "ok" }, config.extras);

  if (config.api) data.api = true;

  if (config.db) {
    data.db = false;
    data.db_status = "unknown";
    getMongooseStatus(config, data);
    await getSequelizeStatus(config, data);
    await getIORedisStatus(config, data);
  }

  getSystemStatusInfo(config, data);

  return data;
};

const MiddlewareWrapper = (config) => {
  const validatedConfig = validateConfiguration(config);
  const middleware = (req, res, next) => {
    if (req.path === validatedConfig.path) {
      return buildResponse(validatedConfig)
        .then((data) => res.send(data))
        .catch(next);
    } else {
      return next();
    }
  };

  middleware.middleware = middleware;
  middleware.getStatus = middleware;
  return middleware;
};

module.exports = MiddlewareWrapper;
module.exports.MiddlewareWrapper = MiddlewareWrapper;
