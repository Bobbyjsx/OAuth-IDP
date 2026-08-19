"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Turnstile, type TurnstileRef } from "@/components/ui/turnstile";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useCountdown } from "@/hooks/use-countdown";
import { getServerError, useForgotPassword } from "@/api";
import { itemVariants } from "@/lib/motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  turnstile_token: z.string().min(1, "Please complete the security check."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { session } = useAuthSession();
  const RESEND_COOLDOWN_SECONDS = 60;
  const [success, setSuccess] = useState(false);
  const [resendTurnstileToken, setResendTurnstileToken] = useState<string>("");
  const resendTurnstileRef = useRef<TurnstileRef>(null);

  const { countdown: resendCountdown, start: startCountdown } = useCountdown({
    seconds: RESEND_COOLDOWN_SECONDS,
    autoStart: false,
  });
  const turnstileRef = useRef<TurnstileRef>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      turnstile_token: "",
    },
  });

  const { mutate: performSendReset, isPending } = useForgotPassword(session?.session_id ?? "", {
    onSuccess: () => {
      setSuccess(true);
      startCountdown();
      toast.success("Password reset link sent!");
    },
    onError: (err: unknown) => {
      form.setValue("turnstile_token", "");
      turnstileRef.current?.reset();
      resendTurnstileRef.current?.reset();
      setResendTurnstileToken("");
      toast.error(getServerError(err, "Failed to process request. Please try again."));
    },
  });

  if (!session) return null;

  const onSubmit = (values: ForgotPasswordValues) => {
    const token = values.turnstile_token || turnstileRef.current?.getResponse();
    if (!token) {
      form.setError("turnstile_token", { message: "Please complete the security check." });
      return;
    }
    performSendReset({ email: values.email, turnstile_token: token });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    const token = form.getValues("turnstile_token") || turnstileRef.current?.getResponse();
    if (token && !form.getValues("turnstile_token")) {
      form.setValue("turnstile_token", token, { shouldValidate: true });
    }
    return form.handleSubmit(onSubmit)(e);
  };

  if (success) {
    const canResend = resendCountdown === 0 && !isPending && !!resendTurnstileToken;
    return (
      <div className="w-full relative">
        <motion.div
          variants={itemVariants}
          className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-center"
        >
          <p className="text-body-md text-gray-medium dark:text-zinc-400 font-medium mb-8 leading-relaxed">
            If an account exists for{" "}
            <span className="text-on-surface dark:text-zinc-100 font-semibold">
              {form.getValues("email")}
            </span>
            , you will receive instructions to reset your password.
          </p>

          <div className="hidden">
            <Turnstile
              ref={resendTurnstileRef}
              action="forgot-password-resend"
              onSuccess={(token) => setResendTurnstileToken(token)}
              onError={() => resendTurnstileRef.current?.reset()}
              onExpire={() => resendTurnstileRef.current?.reset()}
            />
          </div>

          <div className="space-y-4">
            <Link
              href={`/auth/${session.session_id}/login`}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-[15px] font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 h-10 px-6 py-2 w-full"
            >
              Return to Login
            </Link>

            <div className="text-center pt-2">
              {resendCountdown > 0 ? (
                <p className="text-body-md text-gray-medium dark:text-zinc-500">
                  Resend link in{" "}
                  <span className="tabular-nums font-medium text-on-surface dark:text-zinc-300">
                    {resendCountdown}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    performSendReset({
                      email: form.getValues("email"),
                      turnstile_token: resendTurnstileToken,
                    })
                  }
                  disabled={!canResend}
                  className="text-body-md text-gray-medium dark:text-zinc-400 hover:text-on-surface dark:hover:text-zinc-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed underline-offset-4 hover:underline"
                >
                  {isPending ? "Sending…" : "Resend link"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <motion.div variants={itemVariants}>
        <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="Email"
              autoComplete="email"
              placeholder="name@example.com"
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />

            <Turnstile
              ref={turnstileRef}
              action="forgot-password"
              error={form.formState.errors.turnstile_token?.message}
              onSuccess={(token) =>
                form.setValue("turnstile_token", token, { shouldValidate: true })
              }
              onError={() => {
                form.setValue("turnstile_token", "");
                turnstileRef.current?.reset();
              }}
              onExpire={() => form.setValue("turnstile_token", "", { shouldValidate: true })}
            />

            <div className="pt-3">
              <Button
                type="submit"
                className="w-full h-10 text-[15px] rounded-xl font-medium"
                isLoading={isPending}
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
      <motion.p
        variants={itemVariants}
        className="text-body-md text-gray-medium dark:text-zinc-400 mt-8 text-center"
      >
        Remember your password?{" "}
        <Link
          href={`/auth/${session.session_id}/login`}
          prefetch={true}
          className="text-on-surface dark:text-zinc-100 font-medium underline-offset-4 transition-colors duration-200 hover:underline"
        >
          Sign in
        </Link>
      </motion.p>
    </div>
  );
}
