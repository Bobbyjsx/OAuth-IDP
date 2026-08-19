"use client";

import { CancelButton } from "@/components/modules/auth/CancelButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Turnstile, type TurnstileRef } from "@/components/ui/turnstile";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getServerError, useSignup } from "@/api";
import { itemVariants } from "@/lib/motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  turnstile_token: z.string().min(1, "Please complete the security check."),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { session } = useAuthSession();
  const turnstileRef = useRef<TurnstileRef>(null);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      turnstile_token: "",
    },
  });

  const { mutate: performSignup, isPending } = useSignup<SignupValues>(session?.session_id ?? "", {
    onSuccess: (data) => {
      if (!session) return;
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else if (
        ("email_verification_required" in data && data.email_verification_required) ||
        session.application.require_email_verification
      ) {
        // Store email in sessionStorage — never in the URL (session is a bearer token)
        sessionStorage.setItem(`verify_email_${session.session_id}`, form.getValues("email"));
        window.location.href = `/auth/${session.session_id}/verify-email`;
      } else {
        toast.success("Account created successfully!");
        window.location.href = `/auth/${session.session_id}/login`;
      }
    },
    onError: (err: unknown) => {
      form.setValue("turnstile_token", "");
      turnstileRef.current?.reset();
      toast.error(getServerError(err, "Failed to create account. Please try again."));
    },
  });

  if (!session) return null;

  const onSubmit = (values: SignupValues) => {
    const token = values.turnstile_token || turnstileRef.current?.getResponse();
    if (!token) {
      form.setError("turnstile_token", { message: "Please complete the security check." });
      return;
    }
    performSignup({ ...values, turnstile_token: token });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    const token = form.getValues("turnstile_token") || turnstileRef.current?.getResponse();
    if (token && !form.getValues("turnstile_token")) {
      form.setValue("turnstile_token", token, { shouldValidate: true });
    }
    return form.handleSubmit(onSubmit)(e);
  };

  if (!session.application.allow_signup) {
    return (
      <div className="w-full relative">
        <motion.div
          variants={itemVariants}
          className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-center"
        >
          <p className="text-body-md text-gray-medium dark:text-zinc-400 font-medium">
            Sign up is currently disabled for this application.
          </p>
          <Link
            href={`/auth/${session.session_id}/login`}
            className="mt-6 block text-on-surface dark:text-zinc-100 font-medium underline-offset-4 transition-colors duration-200 hover:underline"
          >
            Return to Login
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
              autoComplete="new-password"
              error={form.formState.errors.password?.message}
              {...form.register("password")}
            />

            <Turnstile
              ref={turnstileRef}
              action="signup"
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

      <motion.p
        variants={itemVariants}
        className="text-body-md text-gray-medium dark:text-zinc-400 mt-8 text-center"
      >
        Already have an account?{" "}
        <Link
          href={`/auth/${session.session_id}/login`}
          prefetch={true}
          className="text-on-surface dark:text-zinc-100 font-medium underline-offset-4 transition-colors duration-200 hover:underline"
        >
          Sign in
        </Link>
      </motion.p>

      <motion.div variants={itemVariants} className="mt-6 flex justify-center">
        <CancelButton sessionId={session.session_id} appName={session.application.name} />
      </motion.div>
    </div>
  );
}
