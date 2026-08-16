"use client";

import { useAuthSession } from "@/hooks/use-auth-session";
import { cn } from "@/lib/utils";
import * as React from "react";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  logoOnly?: boolean;
  iconContainerClassName?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function Logo({
  logoOnly = false,
  className,
  iconContainerClassName,
  iconClassName,
  textClassName,
  ...props
}: LogoProps) {
  const { session } = useAuthSession();

  if (!session) return null;

  if (!logoOnly && session.application.logo_with_text) {
    return (
      <div className={cn("flex shrink-0 items-center", className)} {...props}>
        <img
          src={session.application.logo_with_text}
          alt={`${session.application.name} logo`}
          className={cn("h-10 w-auto object-contain", iconClassName)}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)} {...props}>
      <div className={cn("flex shrink-0 items-center justify-center", iconContainerClassName)}>
        {session.application.logo_url ? (
          <img
            src={session.application.logo_url}
            alt={`${session.application.name} icon`}
            className={cn("h-8 w-auto object-contain text-on-surface", iconClassName)}
          />
        ) : (
          <div
            className={cn(
              "h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm",
              iconClassName,
            )}
          >
            <span className="text-[15px] font-medium text-zinc-600 dark:text-zinc-400">
              {session.application.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      {!logoOnly && (
        <span
          className={cn(
            "text-headline-md text-on-surface dark:text-zinc-100 tracking-tight-editorial font-semibold",
            textClassName,
          )}
        >
          {session.application.name}
        </span>
      )}
    </div>
  );
}
