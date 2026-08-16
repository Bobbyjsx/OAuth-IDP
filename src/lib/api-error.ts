import axios from "axios";

/**
 * All error codes returned by the Identity Service.
 * Values match the `error` field in:
 *   { "error": "<code>", "error_description": "<message>" }
 */
export enum ApiErrorCode {
  // ── Session lifecycle ──────────────────────────────────────────────────────
  SessionExpired = "session_expired",
  SessionCancelled = "session_cancelled",

  // ── Authentication ─────────────────────────────────────────────────────────
  InvalidCredentials = "invalid_credentials",
  AccountLocked = "account_locked",
  AccountDisabled = "account_disabled",

  // ── Email verification ─────────────────────────────────────────────────────
  InvalidVerificationToken = "invalid_verification_token",
  VerificationTokenExpired = "verification_token_expired",
  OtpAttemptsExceeded = "otp_attempts_exceeded",

  // ── Password reset ─────────────────────────────────────────────────────────
  InvalidResetToken = "invalid_reset_token",
  ResetTokenExpired = "reset_token_expired",

  // ── General ────────────────────────────────────────────────────────────────
  AccessDenied = "access_denied",
  NotFound = "not_found",
  ServerError = "server_error",
}

/**
 * Extracts the `error` code from an Axios error response, typed as
 * `ApiErrorCode | null`. Returns `null` for non-API errors (network issues,
 * unexpected shapes, etc.).
 */
export function getApiErrorCode(err: unknown): ApiErrorCode | null {
  if (!axios.isAxiosError(err)) return null;
  const code = err.response?.data?.error;
  return typeof code === "string" ? (code as ApiErrorCode) : null;
}

/**
 * Returns true when the error means the session can no longer be used
 * and the UI should transition to the expired/cancelled screen.
 */
export function isSessionEndedError(code: ApiErrorCode | null): boolean {
  return code === ApiErrorCode.SessionExpired || code === ApiErrorCode.SessionCancelled;
}
