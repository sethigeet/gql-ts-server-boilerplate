import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { hash } from "argon2";

import { ValidateArgs } from "../../../shared/decorators";
import { sendEmail } from "../../../shared/utils";
import { Context } from "../../../shared/types";

import {
  createResetPasswordLink,
  lockUserAccount,
  removeAllUserSessions,
} from "../utils";
import {
  changePasswordSchema,
  forgotPasswordSchema,
} from "../utils/validation/schemas";
import {
  getDoesNotExistMessage,
  getEmailNotConfirmedMessage,
  getInvalidTokenMessage,
} from "../utils/validation/errorMessages";
import { User } from "../../userEntity";
import { RESET_PASSWORD_PREFIX } from "../cosntants";

import { ChangePasswordInput, ForgotPasswordInput } from "./inputTypes";
import { ResetPasswordResponse } from "./responseTypes";

@Resolver(() => User)
export class ResetPasswordResolver {
  @ValidateArgs<ResetPasswordResponse>(forgotPasswordSchema, "credentials")
  @Mutation(() => ResetPasswordResponse)
  async forgotPassword(
    @Arg("credentials") { usernameOrEmail }: ForgotPasswordInput,
    @Ctx() { redisClient }: Context
  ): Promise<ResetPasswordResponse> {
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
        successful: false,
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
        successful: false,
      };
    }

    const url = await createResetPasswordLink(
      process.env.FRONTEND_HOST,
      user.id,
      redisClient
    );
    if (process.env.NODE_ENV !== "test") {
      await sendEmail(user.email, "Reset your password!", url);
    }
    await removeAllUserSessions(user.id, redisClient);
    await lockUserAccount(user.id, "forgotPassword");

    return { successful: true };
  }

  @ValidateArgs<ResetPasswordResponse>(changePasswordSchema, "credentials")
  @Mutation(() => ResetPasswordResponse)
  async changePassword(
    @Arg("credentials") { token, newPassword }: ChangePasswordInput,
    @Ctx() { redisClient }: Context
  ): Promise<ResetPasswordResponse> {
    const tokenInRedis = RESET_PASSWORD_PREFIX + token;
    const userId = await redisClient.get(tokenInRedis);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: getInvalidTokenMessage(),
          },
        ],
        successful: false,
      };
    }

    const user = await User.findOne(userId);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: getDoesNotExistMessage("user"),
          },
        ],
        successful: false,
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
        successful: false,
      };
    }

    try {
      const hashedPassword = await hash(newPassword);
      await User.update(
        { id: userId },
        { password: hashedPassword, forgotPasswordLocked: false }
      );
      await redisClient.del(tokenInRedis);
    } catch {
      return {
        errors: [
          {
            field: "forgotPassword",
            message: "An error occurred while updating your password!",
          },
        ],
        successful: false,
      };
    }

    return { successful: true };
  }
}
