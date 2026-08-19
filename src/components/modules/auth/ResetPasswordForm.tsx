"use client";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Turnstile, type TurnstileRef } from "@/components/ui/turnstile";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getServerError, useResetPassword } from "@/api";
import { itemVariants } from "@/lib/motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const resetPasswordSchema = z
  .object({
    new_password: z.string().min(8, "Password must be at least 8 characters."),
    confirm_password: z.string(),
    turnstile_token: z.string().min(1, "Please complete the security check."),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const { session } = useAuthSession();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [success, setSuccess] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
      turnstile_token: "",
    },
  });

  const { mutate: performReset, isPending } = useResetPassword<{
    reset_token: string;
    new_password: string;
    turnstile_token?: string;
  }>(session?.session_id ?? "", {
    onSuccess: () => {
      setSuccess(true);
      toast.success("Password reset successfully!");
    },
    onError: (err: unknown) => {
      form.setValue("turnstile_token", "");
      turnstileRef.current?.reset();
      toast.error(
        getServerError(err, "Failed to reset password. The link might be expired or invalid."),
      );
    },
  });

  if (!session) return null;

  const onSubmit = (values: ResetPasswordValues) => {
    if (!token) {
      toast.error("Missing reset token. Please use the link from your email.");
      return;
    }
    const turnToken = values.turnstile_token || turnstileRef.current?.getResponse();
    if (!turnToken) {
      form.setError("turnstile_token", { message: "Please complete the security check." });
      return;
    }
    performReset({
      reset_token: token,
      new_password: values.new_password,
      turnstile_token: turnToken,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    const turnToken = form.getValues("turnstile_token") || turnstileRef.current?.getResponse();
    if (turnToken && !form.getValues("turnstile_token")) {
      form.setValue("turnstile_token", turnToken, { shouldValidate: true });
    }
    return form.handleSubmit(onSubmit)(e);
  };

  if (!token) {
    return (
      <div className="w-full relative">
        <motion.div
          variants={itemVariants}
          className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-center"
        >
          <p className="text-body-md text-gray-medium dark:text-zinc-400 font-medium mb-8 leading-relaxed">
            The password reset link is missing a required token.
          </p>
          <Link
            href={`/auth/${session.session_id}/forgot-password`}
            prefetch={true}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-[15px] font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 border border-[rgba(0,0,0,0.06)] bg-gray-light dark:bg-zinc-800 hover:bg-[#eaeaea] dark:hover:bg-zinc-700 active:scale-[0.98] h-10 px-6 py-2 w-full text-on-surface dark:text-zinc-100"
          >
            Request New Link
          </Link>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full relative">
        <motion.div
          variants={itemVariants}
          className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-center"
        >
          <p className="text-body-md text-gray-medium dark:text-zinc-400 font-medium mb-8 leading-relaxed">
            Your password has been successfully reset.
          </p>
          <Link
            href={`/auth/${session.session_id}/login`}
            prefetch={true}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-[15px] font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 h-10 px-6 py-2 w-full"
          >
            Sign in with new password
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <motion.div variants={itemVariants}>
        <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <PasswordInput
              id="new_password"
              label="New Password"
              autoComplete="new-password"
              error={form.formState.errors.new_password?.message}
              {...form.register("new_password")}
            />

            <PasswordInput
              id="confirm_password"
              label="Confirm Password"
              autoComplete="new-password"
              error={form.formState.errors.confirm_password?.message}
              {...form.register("confirm_password")}
            />

            <Turnstile
              ref={turnstileRef}
              action="reset-password"
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
                Reset Password
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
