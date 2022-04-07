import { Redis } from "ioredis";
import { CONFIRM_EMAIL_PREFIX, RESET_PASSWORD_PREFIX } from "../cosntants";
import { v4 } from "uuid";

export const createConfirmEmailLink = async (
  baseURL: string,
  userId: string,
  redisClient: Redis
): Promise<string> => {
  const token = v4();
  const tokenInRedis = CONFIRM_EMAIL_PREFIX + token;
  await redisClient.set(tokenInRedis, userId, "ex", 60 * 60 * 24 * 7); // 7 days

  return `${baseURL}/confirm-email/${token}`;
};

export const createResetPasswordLink = async (
  baseURL: string,
  userId: string,
  redisClient: Redis
): Promise<string> => {
  const token = v4();
  const tokenInRedis = RESET_PASSWORD_PREFIX + token;
  await redisClient.set(tokenInRedis, userId, "ex", 60 * 20); // 20 mins

  return `${baseURL}/change-password/${token}`;
};
