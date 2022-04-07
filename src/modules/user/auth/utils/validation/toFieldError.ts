import { ValidationError } from "yup";

import { FieldError } from "../../../../shared/responseTypes";

export const toFieldError = (errors: ValidationError): FieldError[] => {
  const mappedErrors: FieldError[] = [];

  errors.inner.forEach((error) => {
    if (error.path && error.message) {
      const mappedError: FieldError = {
        field: error.path,
        message: error.errors[0],
      };
      mappedErrors.push(mappedError);
    }
  });

  return mappedErrors;
};
