"use client";

import { oauthApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

export default function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: oauthApi.checkHealth,
    retry: 1,
    refetchInterval: 30000,
  });

  const isHealthy = !isError && data;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 font-sans text-on-surface">
      <div className="w-full max-w-[400px] ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-left relative overflow-hidden">
        {/* Structural signature: stark top indicator line */}
        <div
          className={cn(
            "absolute left-0 top-0 w-full h-[3px]",
            isLoading
              ? "bg-zinc-400 dark:bg-zinc-600 animate-pulse"
              : isHealthy
                ? "bg-zinc-900 dark:bg-zinc-100"
                : "bg-red-500",
          )}
        />

        <div className="mb-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 font-medium">
            System Status
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-zinc-400 animate-spin" />
            ) : isHealthy ? (
              <ShieldCheck className="h-4 w-4 text-zinc-400" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-red-500" />
            )}
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isLoading
                  ? "bg-zinc-300 dark:bg-zinc-700 animate-pulse"
                  : isHealthy
                    ? "bg-emerald-500"
                    : "bg-red-500 animate-pulse",
              )}
            />
          </div>
        </div>

        <h1 className="text-xl font-medium tracking-tight-editorial text-zinc-900 dark:text-zinc-100 mb-3">
          Identity Provider
        </h1>

        <p className="text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {isLoading
            ? "Checking service availability..."
            : isHealthy
              ? "The OAuth 2.0 Identity service is active and securely authenticating requests. Authentication requests should be initiated via your application."
              : "The Identity service is currently unreachable or experiencing degraded performance. Please try again later."}
        </p>
      </div>
    </div>
  );
}
