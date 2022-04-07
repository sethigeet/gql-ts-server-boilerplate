import { Redis } from "ioredis";

import { USER_SESSION_IDS_PREFIX, SESSION_ID_PREFIX } from "../cosntants";

export const removeAllUserSessions = async (
  userId: string,
  redisClient: Redis
): Promise<void> => {
  const sessionIds = await redisClient.lrange(
    USER_SESSION_IDS_PREFIX + userId,
    0,
    -1
  );
  const promises: Promise<number>[] = [];
  sessionIds.forEach((id) =>
    promises.push(redisClient.del(SESSION_ID_PREFIX + id))
  );
  await Promise.all(promises);
};
