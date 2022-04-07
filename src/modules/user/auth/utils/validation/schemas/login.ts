import * as yup from "yup";

import { getRequiredMessage } from "../errorMessages";

export const loginSchema = yup.object().shape({
  usernameOrEmail: yup.string().required(getRequiredMessage("username/email")),
  password: yup.string().required(getRequiredMessage("password")),
});
