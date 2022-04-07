import { BuildSchemaOptions } from "type-graphql";

import { ConfirmEmailResolver } from "./confirmEmail";
import { LoginResolver } from "./login";
import { LogoutResolver } from "./logout";
import { MeResolver } from "./me";
import { RegisterResolver } from "./register";
import { ResetPasswordResolver } from "./resetPassword";

export const authResolvers: BuildSchemaOptions["resolvers"] = [
  RegisterResolver,
  ConfirmEmailResolver,
  LoginResolver,
  MeResolver,
  LogoutResolver,
  ResetPasswordResolver,
];
