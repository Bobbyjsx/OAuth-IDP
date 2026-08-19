"use client";

import React, { useEffect, useImperativeHandle, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          action?: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "error-callback"?: (errorCode?: string) => void;
          "expired-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse?: (widgetId?: string) => string | undefined;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export interface TurnstileRef {
  reset: () => void;
  getResponse: () => string | undefined;
}

interface TurnstileProps {
  siteKey?: string;
  action: string;
  onSuccess: (token: string) => void;
  onError?: (error?: string) => void;
  onExpire?: () => void;
  error?: string;
  className?: string;
}

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";
const TURNSTILE_API_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit";

export const Turnstile = React.forwardRef<TurnstileRef, TurnstileProps>(
  (
    {
      siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEVN54c9DUqUyfaO",
      action,
      onSuccess,
      onError,
      onExpire,
      error,
      className = "",
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [isWidgetRendered, setIsWidgetRendered] = React.useState(false);
    const callbacksRef = useRef({ onSuccess, onError, onExpire });
    callbacksRef.current = { onSuccess, onError, onExpire };

    const getDOMToken = () => {
      if (widgetIdRef.current && window.turnstile?.getResponse) {
        const res = window.turnstile.getResponse(widgetIdRef.current);
        if (res) return res;
      }
      const input = containerRef.current?.querySelector(
        'input[name="cf-turnstile-response"]',
      ) as HTMLInputElement | null;
      return input?.value || undefined;
    };

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
      getResponse: getDOMToken,
    }));

    useEffect(() => {
      let isMounted = true;

      const renderWidget = () => {
        if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action,
            theme: "auto",
            callback: (token) => {
              if (isMounted) callbacksRef.current.onSuccess(token);
            },
            "error-callback": (err) => {
              if (isMounted) callbacksRef.current.onError?.(err);
            },
            "expired-callback": () => {
              if (isMounted) callbacksRef.current.onExpire?.();
            },
          });
          if (widgetIdRef.current && isMounted) {
            setIsWidgetRendered(true);
          }
        } catch {
          // Duplicate renders are swallowed; the widget is already mounted.
        }
      };

      if (window.turnstile) {
        renderWidget();
      } else {
        let script = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
        if (!script) {
          script = document.createElement("script");
          script.id = TURNSTILE_SCRIPT_ID;
          script.src = TURNSTILE_API_URL;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }
        script.addEventListener("load", renderWidget);

        const prevCallback = window.onloadTurnstileCallback;
        window.onloadTurnstileCallback = () => {
          if (prevCallback) prevCallback();
          renderWidget();
        };
      }

      // Observe DOM mutations to sync token value and detect widget render
      const observer = new MutationObserver(() => {
        if (isMounted) {
          if (!isWidgetRendered && (containerRef.current?.children.length || 0) > 0) {
            setIsWidgetRendered(true);
          }
          const token = getDOMToken();
          if (token) {
            callbacksRef.current.onSuccess(token);
          }
        }
      });

      if (containerRef.current) {
        observer.observe(containerRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["value"],
        });
      }

      return () => {
        isMounted = false;
        observer.disconnect();
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {}
          widgetIdRef.current = null;
        }
      };
    }, [siteKey, action]);

    return (
      <div className="w-full space-y-1">
        <div className="relative min-h-[65px] my-2">
          {!isWidgetRendered && (
            <div className="h-[65px] w-full max-w-[300px] rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800" />
                <div className="space-y-1.5">
                  <div className="h-3 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-2 w-16 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 opacity-60" />
            </div>
          )}
          <div
            ref={containerRef}
            className={`cf-turnstile min-h-[65px] ${!isWidgetRendered ? "opacity-0 absolute inset-0 pointer-events-none" : "opacity-100 transition-opacity duration-200"} ${className}`}
          />
        </div>
        {error && <p className="text-[13px] text-red-500 font-medium">{error}</p>}
      </div>
    );
  },
);

Turnstile.displayName = "Turnstile";
