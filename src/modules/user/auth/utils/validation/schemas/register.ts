import * as yup from "yup";

import {
  getInvalidEmailMessage,
  getMinLenMessage,
  getMustNotContainMessage,
  getRequiredMessage,
} from "../errorMessages";

export const registerSchema = yup.object().shape({
  email: yup
    .string()
    .required(getRequiredMessage("email"))
    .email(getInvalidEmailMessage()),
  username: yup
    .string()
    .required(getRequiredMessage("username"))
    .min(3, getMinLenMessage("username"))
    .test(
      "Username should not include @ symbol",
      getMustNotContainMessage("Username", "@"),
      (value) => {
        if (value?.includes("@")) {
          return false;
        }
        return true;
      }
    ),
  password: yup
    .string()
    .required(getRequiredMessage("password"))
    .min(3, getMinLenMessage("password")),
});
