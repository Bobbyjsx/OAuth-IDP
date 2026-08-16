export * from "./auth-session";
export * from "./auth";
export * from "./verification";
export * from "./password";
export * from "./health";
export { getServerError } from "@/lib/axios";
export { ApiErrorCode, getApiErrorCode, isSessionEndedError } from "@/lib/api-error";

import * as authSession from "./auth-session";
import * as auth from "./auth";
import * as verification from "./verification";
import * as password from "./password";
import * as health from "./health";

export const oauthApi = {
  ...health,
  ...authSession,
  ...auth,
  ...verification,
  ...password,
};
