"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getServerError, oauthApi } from "@/lib/api";
import type { OAuthFlowResponse, OAuthRedirectResponse } from "@/types/oauth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type SignupValues = z.infer<typeof signupSchema>;

import { itemVariants } from "@/lib/motion";
import { motion } from "framer-motion";

export function SignupForm() {
  const { session } = useAuthSession();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: (values: SignupValues) =>
      session
        ? oauthApi.signup(session.session_id, values)
        : Promise.reject(new Error("No session")),
    onSuccess: (data: OAuthRedirectResponse | OAuthFlowResponse) => {
      if (!session) return;
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else if (
        ("email_verification_required" in data &&
          data.email_verification_required) ||
        session.application.require_email_verification
      ) {
        // Store email in sessionStorage — never in the URL (session is a bearer token)
        sessionStorage.setItem(
          `verify_email_${session.session_id}`,
          form.getValues("email"),
        );
        window.location.href = `/auth/${session.session_id}/verify-email`;
      } else {
        toast.success("Account created successfully!");
        window.location.href = `/auth/${session.session_id}/login`;
      }
    },
    onError: (err: unknown) => {
      toast.error(
        getServerError(err, "Failed to create account. Please try again."),
      );
    },
  });

  if (!session) return null;

  const onSubmit = (values: SignupValues) => {
    signupMutation.mutate(values);
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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

            <div className="pt-3">
              <Button
                type="submit"
                className="w-full h-10 text-[15px] rounded-xl font-medium"
                isLoading={signupMutation.isPending}
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
    </div>
  );
}
