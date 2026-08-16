"use client";

import { LoadingSkeleton } from "@/app/auth/[session_id]/LoadingSkeleton";
import { Logo } from "@/components/ui/logo";
import { useAuthSession } from "@/hooks/use-auth-session";
import { containerVariants, itemVariants } from "@/lib/motion";
import { generateColorScale } from "@/lib/theme";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { ErrorState } from "../ui/error-state";

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

  const subtitleMap: Record<string, string> = {
    login: "Sign in to continue to your workspace.",
    signup: "Create an account to continue to your workspace.",
    "forgot-password": "Enter your email to reset your password.",
    "reset-password": "Choose a new password for your account.",
    "verify-email": "Verify your email address to continue.",
  };

  let subtitle = "Continue to your workspace.";
  const currentView = pathname.split("/").pop();

  if (currentView && currentView in subtitleMap) {
    subtitle = subtitleMap[currentView];
  }

  const validSessions = ["pending", "authenticated"];
  const isSessionValid = validSessions.includes(session.status);

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

        {!isSessionValid ? (
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
