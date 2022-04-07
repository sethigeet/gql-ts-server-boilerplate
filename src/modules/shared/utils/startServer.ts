import "dotenv-safe/config";
import "reflect-metadata";

// Express
import express, { Application } from "express";
import cors from "cors";
import session from "express-session";
import rateLimit from "express-rate-limit";
import RateLimitRedisStore from "rate-limit-redis";

// Redis
import Redis from "ioredis";
import connectRedis from "connect-redis";

// GraphQL
import { ApolloServer } from "apollo-server-express";

// Typeorm
import { createConnection, Connection, getConnectionOptions } from "typeorm";

// Utils
import { createSchema } from "./createSchema";

// Constants
import { COOKIE_NAME, SESSION_ID_PREFIX } from "../../user/auth/cosntants";
import { __prod__ } from "../constants";

// Types
import { Context } from "../types";

export const createTypeormConnection = async (): Promise<Connection> => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  return createConnection({ ...connectionOptions, name: "default" });
};

export const redisClient = new Redis(process.env.REDIS_URL);

// main func to create the server
export const startServer = async (): Promise<
  ReturnType<Application["listen"]>
> => {
  // create the express instance for the server
  const app = express();

  const connection = await createTypeormConnection();
  await connection.runMigrations();

  // add the cors middleware that accepts credentials
  app.use(
    cors({
      origin: process.env.NODE_ENV === "test" ? "*" : process.env.FRONTEND_HOST,
      credentials: true,
    })
  );

  if (!(process.env.NODE_ENV === "test")) {
    // Add the middleware for rate limiting
    const limiter = rateLimit({
      windowMs: 1000 * 60 * 15, // 15 mins
      max: 100,
      store: new RateLimitRedisStore({
        client: redisClient,
      }),
    });
    app.use(limiter);
  }

  // create the redis store for the session
  const RedisStore = connectRedis(session);

  // Add the session middleware
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
        prefix: SESSION_ID_PREFIX,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf token
        secure: __prod__, // cookie will only work in https(not in http) if secure is true
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET as string,
      resave: false,
    })
  );

  // create the graphql server with apollo
  const apolloServer = new ApolloServer({
    schema: await createSchema(),
    context: ({ req, res }): Context => ({
      req,
      res,
      redisClient,
    }),
  });
  // add the middleware
  apolloServer.applyMiddleware({ app, cors: false });

  // start listenting for requests
  const server = app.listen(parseInt(process.env.PORT as string), () => {
    console.log("Server started on localhost:" + process.env.PORT);
  });

  return server;
};
