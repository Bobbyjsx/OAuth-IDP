import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  /** Current OTP value (concatenated string). */
  value: string;
  /** Called with new OTP string whenever it changes. */
  onChange: (value: string) => void;
  /** Length of OTP, default 6. */
  length?: number;
  /** Disable the entire input set. */
  disabled?: boolean;
  /** Show error ring on all boxes. */
  hasError?: boolean;
}

/**
 * A polished OTP input rendered as separate boxes.
 * UI primitive (stateless) — the parent supplies `value` and updates it via `onChange`.
 *
 * Accessibility:
 *   - Each box receives `aria-label` like "Digit 1 of 6".
 *   - First box auto-focuses on mount.
 *   - Arrow keys, backspace, and delete navigation handled.
 *   - Full paste support (pastes fill all boxes from the first digit).
 */
export const OtpInput: React.FC<OtpInputProps> = ({
  value = "",
  onChange,
  length = 6,
  disabled = false,
  hasError = false,
}) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (!disabled) {
      const id = setTimeout(() => inputsRef.current[0]?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [disabled]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (!raw) return;
    const chars = raw.split("");
    const arr = value.padEnd(length, " ").split("");
    chars.forEach((char, i) => {
      const pos = idx + i;
      if (pos < length) arr[pos] = char;
    });
    const next = arr.slice(0, length).join("").replace(/ /g, "");
    onChange(next);
    const nextIdx = Math.min(idx + chars.length, length - 1);
    inputsRef.current[nextIdx]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.key === "Backspace") {
      if (value[idx]) {
        const arr = value.split("");
        arr[idx] = "";
        onChange(arr.join(""));
      } else if (idx > 0) {
        const arr = value.split("");
        arr[idx - 1] = "";
        onChange(arr.join(""));
        inputsRef.current[idx - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === "Delete") {
      const arr = value.split("");
      arr[idx] = "";
      onChange(arr.join(""));
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!pasted) return;
    const newVal = pasted.slice(0, length);
    onChange(newVal);
    const nextIdx = Math.min(newVal.length, length - 1);
    inputsRef.current[nextIdx]?.focus();
  };

  return (
    <div
      className="flex gap-2 sm:gap-3 justify-center"
      role="group"
      aria-label="Verification code"
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={value[i] ?? ""}
          autoComplete="one-time-code"
          aria-label={`Digit ${i + 1} of ${length}`}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className={cn(
            "w-11 h-14 sm:w-12 sm:h-14",
            "text-center text-xl font-semibold",
            "text-on-surface dark:text-zinc-50",
            "rounded-xl border bg-white dark:bg-zinc-900",
            "transition-all duration-150",
            !hasError && "border-[rgba(0,0,0,0.10)] dark:border-zinc-700",
            !hasError &&
              value[i] &&
              "border-[rgba(0,0,0,0.20)] dark:border-zinc-500",
            !hasError &&
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            hasError &&
              "border-red-400 dark:border-red-500 ring-1 ring-red-400 dark:ring-red-500 focus:outline-none",
            disabled && "opacity-40 cursor-not-allowed",
          )}
        />
      ))}
    </div>
  );
};
