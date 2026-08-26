import type { RequestHandler } from "express";

declare function MiddlewareWrapper(
  config?: MiddlewareWrapper.MiddlewareWrapperConfig,
): MiddlewareWrapper.MiddlewareWrapperReturn;

declare namespace MiddlewareWrapper {
  interface MongooseConnection {
    readyState: number;
  }

  interface MongooseClient {
    connection?: MongooseConnection;
  }

  interface SequelizeClient {
    authenticate(): Promise<unknown>;
  }

  interface IORedisClient {
    status: string;
    set(key: string, value: string): Promise<unknown>;
    ping(): Promise<unknown>;
  }

  interface MiddlewareWrapperConfig {
    path?: string;
    db?: boolean;
    api?: boolean;
    system?: boolean;
    extras?: Record<string, unknown>;
    mongoose?: MongooseClient;
    sequelize?: SequelizeClient;
    ioredis?: IORedisClient;
  }

  type MiddlewareWrapperReturn = RequestHandler & {
    middleware: MiddlewareWrapperReturn;
    getStatus: MiddlewareWrapperReturn;
  };

  const MiddlewareWrapper: (
    config?: MiddlewareWrapperConfig,
  ) => MiddlewareWrapperReturn;
}

export = MiddlewareWrapper;
