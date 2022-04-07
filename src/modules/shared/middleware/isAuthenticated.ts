import { MiddlewareFn } from "type-graphql";

import { Context } from "../types";

export const isAuthenticated: MiddlewareFn<Context> = (
  { context: { req } },
  next
) => {
  if (!req.session.userId) {
    throw new Error("Not Authenticated!");
  }

  return next();
};
