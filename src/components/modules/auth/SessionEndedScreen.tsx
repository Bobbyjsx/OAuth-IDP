"use client";

import { useCountdown } from "@/hooks/use-countdown";
import { itemVariants } from "@/lib/motion";
import { motion } from "framer-motion";

export interface SessionEndedScreenProps {
  status: "expired" | "cancelled";
  appName: string;
  redirectUrl: string | null | undefined;
}

const REDIRECT_COUNTDOWN_SECONDS = 5;

/**
 * Screen displayed when an authentication session is expired or cancelled.
 * Provides clear status communication, a primary return action linking to
 * the RFC error callback URL, and an automated countdown redirect.
 */
export function SessionEndedScreen({ status, appName, redirectUrl }: SessionEndedScreenProps) {
  const { countdown, stop } = useCountdown({
    seconds: REDIRECT_COUNTDOWN_SECONDS,
    autoStart: Boolean(redirectUrl),
    onComplete: () => {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
  });

  const heading = status === "expired" ? "Your session has timed out" : "Authentication cancelled";

  const body =
    status === "expired"
      ? "Your login session has timed out. Please return to the application and try again."
      : "This authentication request was cancelled. You can safely close this window or return to the application.";

  return (
    <motion.div variants={itemVariants}>
      <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-center space-y-5">
        {/* Status icon */}
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
                stop();
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
          <p className="text-body-md text-gray-medium dark:text-zinc-400">
            You may safely close this window.
          </p>
        )}
      </div>
    </motion.div>
  );
}
