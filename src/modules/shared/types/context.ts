import { Request, Response } from "express";
import { SessionData } from "express-session";
import { Redis } from "ioredis";

export type Context = {
  req: Request & { session: SessionData & { userId?: string } };
  res: Response;
  redisClient: Redis;
};
