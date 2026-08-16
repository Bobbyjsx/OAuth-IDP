"use client";

import { oauthApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
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
  const mutation = useMutation({
    mutationFn: () => oauthApi.cancelSession(sessionId),
    onSuccess: (data) => {
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    },
    // If cancel itself fails (e.g. already cancelled), silently ignore — the
    // user can't do anything useful and we avoid a confusing error toast.
  });

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="inline-flex items-center gap-1.5 text-body-md text-gray-medium dark:text-zinc-500 hover:text-on-surface dark:hover:text-zinc-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      Return to {appName}
    </button>
  );
}
