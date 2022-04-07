import { Ctx, Mutation, Resolver } from "type-graphql";

import { Context } from "../../../shared/types";

import { User } from "../../userEntity";
import { COOKIE_NAME } from "../cosntants";
import { removeAllUserSessions } from "../utils";

@Resolver(() => User)
export class LogoutResolver {
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise((resolve) => {
      const { userId } = req.session;

      if (!userId) {
        resolve(false);
        return;
      }

      req.session.destroy((err: Error) => {
        res.clearCookie(COOKIE_NAME);

        if (err) {
          resolve(false);
          return;
        }

        resolve(true);
      });
    });
  }

  @Mutation(() => Boolean)
  async logoutAllSessions(
    @Ctx() { req, res, redisClient }: Context
  ): Promise<boolean> {
    return new Promise((resolve): void => {
      const { userId } = req.session;

      if (!userId) {
        resolve(false);
        return;
      }

      try {
        removeAllUserSessions(userId, redisClient);
      } catch {
        resolve(false);
        return;
      }

      req.session.destroy((err: Error) => {
        res.clearCookie(COOKIE_NAME);

        if (err) {
          resolve(false);
          return;
        }

        resolve(true);
      });
    });
  }
}
