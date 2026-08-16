"use client";

import { LoadingSkeleton } from "@/app/auth/[session_id]/LoadingSkeleton";
import { Logo } from "@/components/ui/logo";
import { useAuthSession } from "@/hooks/use-auth-session";
import { containerVariants, itemVariants } from "@/lib/motion";
import { generateColorScale } from "@/lib/theme";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ErrorState } from "../ui/error-state";

const REDIRECT_COUNTDOWN = 15;

const subtitleMap: Record<string, string> = {
  login: "Sign in to continue to your workspace.",
  signup: "Create an account to continue to your workspace.",
  "forgot-password": "Enter your email to reset your password.",
  "reset-password": "Choose a new password for your account.",
  "verify-email": "Verify your email address to continue.",
};

// ── Expired / Cancelled screen ────────────────────────────────────────────────

interface SessionEndedScreenProps {
  status: "expired" | "cancelled";
  appName: string;
  redirectUrl: string | null | undefined;
}

function SessionEndedScreen({ status, appName, redirectUrl }: SessionEndedScreenProps) {
  const [countdown, setCountdown] = useState(redirectUrl ? REDIRECT_COUNTDOWN : 0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!redirectUrl) return;

    // Kick off auto-redirect countdown
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [redirectUrl]);

  const heading = status === "expired" ? "Your session has timed out" : "Authentication cancelled";

  const body =
    status === "expired"
      ? "Your login session has timed out. Please return to the application and try again."
      : "This authentication request was cancelled. You can safely close this window or return to the application.";

  return (
    <motion.div variants={itemVariants}>
      <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-center space-y-5">
        {/* Icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={1.8}
            stroke="currentColor"
            className="w-6 h-6 text-amber-500"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>

        <div>
          <p className="text-on-surface dark:text-zinc-100 font-semibold text-base">{heading}</p>
          <p className="text-body-md text-gray-medium dark:text-zinc-400 mt-1 leading-relaxed">
            {body}
          </p>
        </div>

        {redirectUrl ? (
          <>
            <button
              type="button"
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                window.location.href = redirectUrl;
              }}
              className="w-full inline-flex items-center justify-center h-11 px-4 rounded-xl bg-primary-600 text-white text-[15px] font-medium hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Return to {appName}
            </button>

            {countdown > 0 && (
              <p className="text-body-md text-gray-medium dark:text-zinc-500">
                Redirecting in{" "}
                <span className="tabular-nums font-medium text-on-surface dark:text-zinc-300">
                  {countdown}s
                </span>
                …
              </p>
            )}
          </>
        ) : (
          // No redirect_url — show a generic message
          <p className="text-body-md text-gray-medium dark:text-zinc-400">
            You may safely close this window.
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Layout wrapper ────────────────────────────────────────────────────────────

export function AuthLayoutWrapper({ children }: { children: ReactNode }) {
  const { session, isLoading, isError } = useAuthSession();
  const pathname = usePathname();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="w-full max-w-[380px]">
          <ErrorState
            title="Invalid request"
            message="This authorization session is invalid or has expired. Return to the application to try again."
          />
        </div>
      </div>
    );
  }

  // Generate full Tailwind color scales if branding colors exist
  const style = {
    ...(session.application.primary_color &&
      generateColorScale(session.application.primary_color, "primary")),
    ...(session.application.secondary_color &&
      generateColorScale(session.application.secondary_color, "secondary")),
  } as React.CSSProperties;

  const currentView = pathname.split("/").pop();
  const subtitle = (currentView && subtitleMap[currentView]) ?? "Continue to your workspace.";

  const validSessions = ["pending", "authenticated"];
  const isSessionValid = validSessions.includes(session.status);
  const isSessionEnded = session.status === "expired" || session.status === "cancelled";

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500"
      style={style}
    >
      <motion.div
        className="w-full max-w-[380px] z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={itemVariants}
          className="mb-10 flex flex-col items-center text-center"
        >
          <Logo className="mb-3 justify-center" />
          {isSessionValid && (
            <p className="text-gray-medium dark:text-zinc-400 text-body-md leading-relaxed">
              {subtitle}
            </p>
          )}
        </motion.div>

        {isSessionEnded ? (
          <SessionEndedScreen
            status={session.status as "expired" | "cancelled"}
            appName={session.application.name}
            redirectUrl={session.redirect_url}
          />
        ) : !isSessionValid ? (
          // completed / unknown statuses — generic fallback
          <motion.div variants={itemVariants}>
            <ErrorState
              title={`Session ${session.status}`}
              message={`This request can no longer be used because it is ${session.status}. Return to the application to try again.`}
            />
          </motion.div>
        ) : (
          children
        )}
      </motion.div>
    </div>
  );
}
