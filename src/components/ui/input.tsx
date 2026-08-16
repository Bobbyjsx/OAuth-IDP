import { cn } from "@/lib/utils";
import * as React from "react";

import { Label } from "@/components/ui/label";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
  action?: React.ReactNode;
  suffix?: React.ReactNode;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, action, suffix, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {(label || action) && (
          <div className="flex items-center justify-between">
            {label && (
              <Label
                htmlFor={props.id}
                className="text-sm text-on-surface dark:text-zinc-100 font-medium"
              >
                {label}
              </Label>
            )}
            {action && <div>{action}</div>}
          </div>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              "h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 focus:border-slate-600 duration-200 ease-in-out",
              error &&
                "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500",
              className,
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <div className="absolute right-0 top-0 h-full flex items-center pr-3">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[13px] text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
