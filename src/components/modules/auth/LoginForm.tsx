"use client";

import { CancelButton } from "@/components/modules/auth/CancelButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Turnstile, type TurnstileRef } from "@/components/ui/turnstile";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getServerError, useLogin } from "@/api";
import { itemVariants } from "@/lib/motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  turnstile_token: z.string().min(1, "Please complete the security check."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { session } = useAuthSession();
  const turnstileRef = useRef<TurnstileRef>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      turnstile_token: "",
    },
  });

  const { mutate: performLogin, isPending } = useLogin<LoginValues>(session?.session_id ?? "", {
    onSuccess: (data) => {
      if (!session) return;
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else if ("email_verification_required" in data && data.email_verification_required) {
        // Store email in sessionStorage — never in the URL (session is a bearer token)
        sessionStorage.setItem(`verify_email_${session.session_id}`, form.getValues("email"));
        window.location.href = `/auth/${session.session_id}/verify-email`;
      } else {
        toast.error("An unexpected response was received.");
      }
    },
    onError: (err: unknown) => {
      form.setValue("turnstile_token", "");
      turnstileRef.current?.reset();
      toast.error(getServerError(err, "Failed to sign in. Please check your credentials."));
    },
  });

  const onSubmit = (values: LoginValues) => {
    const token = values.turnstile_token || turnstileRef.current?.getResponse();
    if (!token) {
      form.setError("turnstile_token", { message: "Please complete the security check." });
      return;
    }
    performLogin({ ...values, turnstile_token: token });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    const token = form.getValues("turnstile_token") || turnstileRef.current?.getResponse();
    if (token && !form.getValues("turnstile_token")) {
      form.setValue("turnstile_token", token, { shouldValidate: true });
    }
    return form.handleSubmit(onSubmit)(e);
  };

  if (!session) return null;

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

            <PasswordInput
              id="password"
              label="Password"
              action={
                <Link
                  href={`/auth/${session.session_id}/forgot-password`}
                  prefetch={true}
                  className="text-sm text-gray-medium hover:text-on-surface dark:hover:text-zinc-100 transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              }
              autoComplete="current-password"
              error={form.formState.errors.password?.message}
              {...form.register("password")}
            />

            <Turnstile
              ref={turnstileRef}
              action="login"
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
                Continue
              </Button>
            </div>
          </form>
        </div>
      </motion.div>

      {session.application.allow_signup && (
        <motion.p
          variants={itemVariants}
          className="text-body-md text-gray-medium dark:text-zinc-400 mt-8 text-center"
        >
          No account yet?{" "}
          <Link
            href={`/auth/${session.session_id}/signup`}
            prefetch={true}
            className="text-on-surface dark:text-zinc-100 font-medium underline-offset-4 transition-colors duration-200 hover:underline"
          >
            Create one
          </Link>
        </motion.p>
      )}

      <motion.div variants={itemVariants} className="mt-6 flex justify-center">
        <CancelButton sessionId={session.session_id} appName={session.application.name} />
      </motion.div>
    </div>
  );
}
