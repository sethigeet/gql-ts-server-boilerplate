import { verify } from "argon2";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

import { Context } from "../../../shared/types";
import { UserResponse } from "../UserResponse";
import { ValidateArgs } from "../../../shared/decorators";

import { loginSchema } from "../utils/validation/schemas";
import {
  getAccountLockedMessage,
  getDoesNotExistMessage,
  getEmailNotConfirmedMessage,
  getIncorrectPasswordMessage,
} from "../utils/validation/errorMessages";
import { User } from "../../userEntity";
import { LoginInput } from "./inputTypes";
import { USER_SESSION_IDS_PREFIX } from "../cosntants";

@Resolver(() => User)
export class LoginResolver {
  @ValidateArgs<UserResponse>(loginSchema, "credentials")
  @Mutation(() => UserResponse)
  async login(
    @Arg("credentials") { usernameOrEmail, password }: LoginInput,
    @Ctx() { req, redisClient }: Context
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    });

    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: getDoesNotExistMessage("username/email"),
          },
        ],
      };
    }

    if (!user.confirmed) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: getEmailNotConfirmedMessage(),
          },
        ],
      };
    }

    if (user.forgotPasswordLocked) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: getAccountLockedMessage("forgotPassword"),
          },
        ],
      };
    }

    const valid = await verify(user.password, password);
    if (!valid) {
      return {
        errors: [{ field: "password", message: getIncorrectPasswordMessage() }],
      };
    }

    req.session.userId = user.id;
    await redisClient.lpush(USER_SESSION_IDS_PREFIX + user.id, req.sessionID);

    return { user };
  }
}
