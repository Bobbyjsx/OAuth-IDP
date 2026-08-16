"use client";

import { CancelButton } from "@/components/modules/auth/CancelButton";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  ApiErrorCode,
  getApiErrorCode,
  getServerError,
  isSessionEndedError,
  useResendOtp,
  useVerifyEmail,
} from "@/api";
import { itemVariants } from "@/lib/motion";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const RESEND_COOLDOWN_SECONDS = 30;
const MAX_ATTEMPTS = 5;

export function VerifyEmailForm() {
  const { session, sessionId } = useAuthSession();

  // Read email stored by Login/SignupForm in sessionStorage — never from the URL.
  // Lazy initializer runs once synchronously, no effect needed.
  const [email] = useState<string>(() =>
    typeof window !== "undefined" && sessionId
      ? (sessionStorage.getItem(`verify_email_${sessionId}`) ?? "")
      : "",
  );

  const [otp, setOtp] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Resend countdown — initialized to cooldown so the timer starts on mount
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Resets and restarts the resend cooldown timer. */
  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setResendCountdown(RESEND_COOLDOWN_SECONDS);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    // Kick off the countdown interval on mount (code was just sent)
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Resend OTP
  const { mutate: performResend, isPending: isResending } = useResendOtp(
    session?.session_id ?? "",
    {
      onSuccess: () => {
        toast.success("A new code has been sent to your email.");
        setOtp("");
        setInlineError(null);
        setAttemptsLeft(null);
        startCountdown();
      },
      onError: (err: unknown) => {
        const code = getApiErrorCode(err);
        if (isSessionEndedError(code)) {
          if (sessionId) sessionStorage.removeItem(`verify_email_${sessionId}`);
        } else {
          toast.error(getServerError(err, "Failed to resend code. Please try again."));
        }
      },
    },
  );

  // Verify OTP
  const { mutate: performVerify, isPending: isVerifying } = useVerifyEmail(
    session?.session_id ?? "",
    {
      onSuccess: (data) => {
        if (data.redirect_url) {
          toast.success("Email verified successfully!");
          // Clean up stored email before leaving
          if (sessionId) sessionStorage.removeItem(`verify_email_${sessionId}`);
          window.location.href = data.redirect_url;
        }
      },
      onError: (err: unknown) => {
        const code = getApiErrorCode(err);

        if (code === ApiErrorCode.InvalidVerificationToken) {
          const remaining = attemptsLeft !== null ? attemptsLeft - 1 : MAX_ATTEMPTS - 1;
          setAttemptsLeft(remaining);
          setInlineError(
            remaining > 0
              ? `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`
              : "Incorrect code.",
          );
          setOtp("");
        } else if (code === ApiErrorCode.OtpAttemptsExceeded) {
          setIsLocked(true);
          setInlineError("Too many incorrect attempts. Please start a new login.");
        } else if (code === ApiErrorCode.VerificationTokenExpired) {
          setInlineError("Your code has expired. Request a new one below.");
          setOtp("");
          // Auto-trigger resend if cooldown is done
          if (resendCountdown === 0) {
            performResend();
          }
        } else if (isSessionEndedError(code)) {
          if (sessionId) sessionStorage.removeItem(`verify_email_${sessionId}`);
        } else {
          setInlineError(getServerError(err, "Failed to verify email. Please try again."));
        }
      },
    },
  );

  if (!session) return null;

  const canSubmit = otp.length === 6 && !isLocked;
  const canResend = resendCountdown === 0 && !isResending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setInlineError(null);
    performVerify(otp);
  };

  // ── Locked state ─────────────────────────────────────────────────────────────
  if (isLocked) {
    return (
      <div className="w-full relative">
        <motion.div variants={itemVariants}>
          <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-6 h-6 text-red-500"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>

            <div>
              <p className="text-on-surface dark:text-zinc-100 font-semibold text-base">
                Too many attempts
              </p>
              <p className="text-body-md text-gray-medium dark:text-zinc-400 mt-1 leading-relaxed">
                This verification session has been locked after too many incorrect attempts. Please
                return to login and try again.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <CancelButton sessionId={session.session_id} appName={session.application.name} />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Normal verify state ───────────────────────────────────────────────────────
  return (
    <div className="w-full relative">
      <motion.div variants={itemVariants}>
        <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10">
          {/* Header */}
          <div className="mb-7 text-center">
            <h1 className="text-on-surface dark:text-zinc-100 font-semibold text-[18px] mb-1">
              Check your email
            </h1>
            <p className="text-body-md text-gray-medium dark:text-zinc-400 leading-relaxed">
              {email ? (
                <>
                  We sent a 6-digit code to{" "}
                  <span className="text-on-surface dark:text-zinc-200 font-medium">{email}</span>
                </>
              ) : (
                "We sent a 6-digit code to your email address."
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP boxes */}
            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={isVerifying || isLocked}
              hasError={!!inlineError}
            />

            {/* Inline error */}
            {inlineError && (
              <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">
                {inlineError}
              </p>
            )}

            {/* Verify button */}
            <div className="pt-1">
              <Button
                type="submit"
                className="w-full h-11 text-[15px] rounded-xl font-medium"
                isLoading={isVerifying}
                disabled={!canSubmit}
              >
                Verify email
              </Button>
            </div>
          </form>

          {/* Resend */}
          <div className="mt-5 text-center">
            {resendCountdown > 0 ? (
              <p className="text-body-md text-gray-medium dark:text-zinc-500">
                Resend code in{" "}
                <span className="tabular-nums font-medium text-on-surface dark:text-zinc-300">
                  {resendCountdown}s
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => performResend()}
                disabled={!canResend}
                className="text-body-md text-gray-medium dark:text-zinc-400 hover:text-on-surface dark:hover:text-zinc-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed underline-offset-4 hover:underline"
              >
                {isResending ? "Sending…" : "Resend code"}
              </button>
            )}
          </div>

          {/* Cancel */}
          <div className="mt-4 flex justify-center">
            <CancelButton sessionId={session.session_id} appName={session.application.name} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
