import { ObjectType, Field } from "type-graphql";

import { User } from "../../user/userEntity";
import { FieldError } from "../../shared/responseTypes";

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}
