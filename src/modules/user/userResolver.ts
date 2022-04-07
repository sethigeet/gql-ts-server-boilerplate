import { BuildSchemaOptions } from "type-graphql";
import { authResolvers } from "./auth/resolver";

export const userResolvers: BuildSchemaOptions["resolvers"] = [
  ...authResolvers,
];
