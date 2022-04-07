import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

import { Context } from "../../../shared/types";
import { UserResponse } from "../UserResponse";

import { getInvalidTokenMessage } from "../utils/validation/errorMessages";
import { User } from "../../userEntity";
import { CONFIRM_EMAIL_PREFIX, USER_SESSION_IDS_PREFIX } from "../cosntants";

@Resolver(() => User)
export class ConfirmEmailResolver {
  @Mutation(() => UserResponse)
  async confirmEmail(
    @Arg("token") token: string,
    @Ctx() { redisClient, req }: Context
  ): Promise<UserResponse> {
    const tokenInRedis = CONFIRM_EMAIL_PREFIX + token;
    const userId = await redisClient.get(tokenInRedis);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: getInvalidTokenMessage(),
          },
        ],
      };
    }

    const user = await User.findOne(userId);
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: getInvalidTokenMessage(),
          },
        ],
      };
    }

    try {
      await User.update({ id: userId }, { confirmed: true });
    } catch {
      return {
        errors: [
          {
            field: "token",
            message: "There was an error while confirming your email!",
          },
        ],
      };
    }

    await redisClient.del(tokenInRedis);

    req.session.userId = user.id;
    await redisClient.lpush(USER_SESSION_IDS_PREFIX + user.id, req.sessionID);

    return { user };
  }
}
