import { createMethodDecorator } from "type-graphql";
import { ValidationError } from "yup";

import { FieldError } from "../responseTypes";
import { toFieldError } from "../../user/auth/utils/validation/toFieldError";

export function ValidateArgs<T>(
  schema: any,
  fieldName: string
): MethodDecorator {
  return createMethodDecorator<T>(async ({ args }, next) => {
    const errors: FieldError[] = [];

    try {
      await schema.validate(args[fieldName], { abortEarly: false });
    } catch (err) {
      errors.push(...toFieldError(err as ValidationError));
    }

    if (errors.length > 0) {
      return { errors };
    }

    return next();
  });
}
