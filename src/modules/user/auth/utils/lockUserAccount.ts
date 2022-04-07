import { User } from "../../userEntity";

type lockUserAccountReason = "forgotPassword";

export const lockUserAccount = async (
  userId: string,
  reason: lockUserAccountReason
): Promise<void> => {
  switch (reason) {
    case "forgotPassword":
      User.update({ id: userId }, { forgotPasswordLocked: true });
  }
};

export const unlockUserAccount = async (
  userId: string,
  reason: lockUserAccountReason
): Promise<void> => {
  switch (reason) {
    case "forgotPassword":
      User.update({ id: userId }, { forgotPasswordLocked: false });
  }
};
