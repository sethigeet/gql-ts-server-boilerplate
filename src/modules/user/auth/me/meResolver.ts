import { Query, Resolver } from "type-graphql";

import { CurrentUser } from "../../../shared/decorators";

import { User } from "../../userEntity";

@Resolver(() => User)
export class MeResolver {
  @Query(() => User, { nullable: true })
  me(@CurrentUser() user: User | undefined): User | undefined {
    return user;
  }
}
