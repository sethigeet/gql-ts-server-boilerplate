import { GraphQLSchema } from "graphql";
import { buildSchema } from "type-graphql";

// Resolvers
import { userResolvers } from "../../user/userResolver";

export const createSchema = async (): Promise<GraphQLSchema> => {
  return await buildSchema({
    resolvers: userResolvers,
    validate: false,
  });
};
