"use client";

import { useCancelSession } from "@/api";
import { Loader2 } from "lucide-react";

interface CancelButtonProps {
  sessionId: string;
  appName: string;
}

/**
 * "Return to {appName}" link that calls POST /cancel and performs a full
 * browser redirect to the RFC-compliant error callback URL returned by the
 * backend. Renders as an unobtrusive text link so it doesn't compete with the
 * primary form action.
 */
export function CancelButton({ sessionId, appName }: CancelButtonProps) {
  const { mutate: cancel, isPending } = useCancelSession(sessionId);

  return (
    <button
      type="button"
      onClick={() => cancel()}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 text-body-md text-gray-medium dark:text-zinc-500 hover:text-on-surface dark:hover:text-zinc-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      Return to {appName}
    </button>
  );
}
