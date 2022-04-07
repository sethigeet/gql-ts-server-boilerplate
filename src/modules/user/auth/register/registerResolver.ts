import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

import { UserResponse } from "../UserResponse";
import { sendEmail } from "../../../shared/utils";
import { Context } from "../../../shared/types";
import { ValidateArgs } from "../../../shared/decorators";

import { createConfirmEmailLink } from "../utils";
import { getUnavailableMessage } from "../utils/validation/errorMessages";
import { RegisterInput } from "./inputTypes";
import { User } from "../../userEntity";

import { registerSchema } from "../utils/validation/schemas";

@Resolver(() => User)
export class RegisterResolver {
  @ValidateArgs<UserResponse>(registerSchema, "credentials")
  @Mutation(() => UserResponse)
  async register(
    @Arg("credentials") { email, username, password }: RegisterInput,
    @Ctx() { redisClient }: Context
  ): Promise<UserResponse> {
    let user;
    try {
      user = await User.create({
        email: email,
        username: username,
        password: password,
      }).save();
    } catch (err) {
      // err.detail.includes("already exists")
      if (err.code === "23505") {
        if (err.detail.includes("Key (username)")) {
          return {
            errors: [
              {
                field: "username",
                message: getUnavailableMessage("username"),
              },
            ],
          };
        } else if (err.detail.includes("Key (email)")) {
          return {
            errors: [
              {
                field: "email",
                message: getUnavailableMessage("email"),
              },
            ],
          };
        }
      }
      return {
        errors: [
          {
            field: "registrationError",
            message: "An error occurred while registering the user!",
          },
        ],
      };
    }

    const confirmEmailLink = await createConfirmEmailLink(
      process.env.FRONTEND_HOST,
      user.id,
      redisClient
    );

    if (process.env.NODE_ENV !== "test") {
      await sendEmail(user.email, "Confirm you password!", confirmEmailLink);
    }

    return { user };
  }
}
