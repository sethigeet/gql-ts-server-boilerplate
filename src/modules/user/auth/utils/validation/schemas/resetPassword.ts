import * as yup from "yup";

import { getMinLenMessage, getRequiredMessage } from "../errorMessages";

export const forgotPasswordSchema = yup.object().shape({
  usernameOrEmail: yup.string().required(getRequiredMessage("username/email")),
});

export const changePasswordSchema = yup.object().shape({
  token: yup.string().required(getRequiredMessage("token")),
  newPassword: yup
    .string()
    .min(3, getMinLenMessage("new password"))
    .required(getRequiredMessage("new password")),
});
