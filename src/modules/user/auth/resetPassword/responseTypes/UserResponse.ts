import { ObjectType, Field } from "type-graphql";

import { FieldError } from "../../../../shared/responseTypes";

@ObjectType()
export class ResetPasswordResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Boolean, { nullable: true })
  successful?: boolean;
}
