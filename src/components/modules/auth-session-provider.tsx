"use client";

import { oauthApi } from "@/lib/api";
import { generateColorScale } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { AuthSessionResponse } from "@/types/oauth";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";

interface AuthSessionContextType {
  session: AuthSessionResponse;
}

const AuthSessionContext = createContext<AuthSessionContextType | null>(null);

export function useAuthSession() {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error(
      "useAuthSession must be used within an AuthSessionProvider",
    );
  }
  return context;
}

export function AuthSessionProvider({
  sessionId,
  children,
}: {
  sessionId: string;
  children: ReactNode;
}) {
  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["authSession", sessionId],
    queryFn: () => oauthApi.getSession(sessionId),
    retry: 0,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-[400px] animate-pulse">
          <div className="flex flex-col items-center mb-8">
            <div className="h-10 w-10 mb-6 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-3" />
            <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
            <div className="space-y-6">
              <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-2" />
              <div className="space-y-3">
                <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-md" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-md" />
              </div>
              <div className="pt-2">
                <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
        <div className="w-full max-w-[400px]">
          <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-900 p-8 shadow-sm text-center">
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 rounded-full border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
              Invalid Request
            </h2>
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
              This authorization session is invalid or has expired. Please
              return to the application to authenticate.
            </p>
          </div>
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

  return (
    <AuthSessionContext.Provider value={{ session }}>
      <div
        className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500"
        style={style}
      >
        <div className="w-full max-w-[400px] z-10">
          <div className="mb-10 flex flex-col items-center text-center">
            {session.application.logo_with_text ? (
              <div className="flex shrink-0 items-center justify-center mb-3">
                <img
                  src={session.application.logo_with_text}
                  alt={`${session.application.name} logo`}
                  className="h-10 w-auto object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2.5 mb-3 justify-center">
                {session.application.logo_url ? (
                  <div className="flex shrink-0 items-center justify-center">
                    <img
                      src={session.application.logo_url}
                      alt={`${session.application.name} logo`}
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0">
                    <span className="text-[15px] font-medium text-zinc-600 dark:text-zinc-400">
                      {session.application.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-headline-md text-on-surface dark:text-zinc-100 tracking-tight-editorial font-semibold">
                  {session.application.name}
                </span>
              </div>
            )}
            
            <p className="text-gray-medium dark:text-zinc-400 text-body-md leading-relaxed max-w-sm">
              {session.application.description || "Sign in to continue to your workspace."}
            </p>
          </div>

          {session.status !== "pending" ? (
            <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 rounded-full border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
                Session{" "}
                {session.status.charAt(0).toUpperCase() +
                  session.status.slice(1)}
              </h2>
              <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
                This request can no longer be used because it is{" "}
                {session.status}. Please return to the application to try again.
              </p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </AuthSessionContext.Provider>
  );
}
