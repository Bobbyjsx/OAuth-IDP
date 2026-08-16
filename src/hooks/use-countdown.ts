import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCountdownOptions {
  /** The starting countdown duration in seconds. */
  seconds: number;
  /** Whether the countdown should start automatically on mount. Defaults to false. */
  autoStart?: boolean;
  /** Optional callback fired when the countdown reaches 0. */
  onComplete?: () => void;
  /** Interval step in milliseconds. Defaults to 1000ms. */
  intervalMs?: number;
}

export function useCountdown({
  seconds,
  autoStart = false,
  onComplete,
  intervalMs = 1000,
}: UseCountdownOptions) {
  const [countdown, setCountdown] = useState(autoStart ? seconds : 0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (customSeconds?: number) => {
      stop();
      const initial = customSeconds ?? seconds;
      setCountdown(initial);

      if (initial <= 0) {
        onCompleteRef.current?.();
        return;
      }

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            stop();
            onCompleteRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, intervalMs);
    },
    [seconds, intervalMs, stop],
  );

  const reset = useCallback(() => {
    stop();
    setCountdown(seconds);
  }, [seconds, stop]);

  useEffect(() => {
    if (!autoStart || seconds <= 0) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoStart, seconds, intervalMs]);

  return {
    countdown,
    isRunning: countdown > 0,
    start,
    stop,
    reset,
  };
}
