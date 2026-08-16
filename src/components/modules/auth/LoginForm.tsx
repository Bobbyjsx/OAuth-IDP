"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

import { useAuthSession } from "@/hooks/use-auth-session";
import { getServerError, oauthApi } from "@/lib/api";
import type { OAuthFlowResponse, OAuthRedirectResponse } from "@/types/oauth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginValues = z.infer<typeof loginSchema>;

import { itemVariants } from "@/lib/motion";
import { motion } from "framer-motion";

export function LoginForm() {
  const { session } = useAuthSession();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) =>
      session
        ? oauthApi.login(session.session_id, values)
        : Promise.reject(new Error("No session")),
    onSuccess: (data: OAuthRedirectResponse | OAuthFlowResponse) => {
      if (!session) return;
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else if (data.email_verification_required) {
        // Store email in sessionStorage — never in the URL (session is a bearer token)
        sessionStorage.setItem(
          `verify_email_${session.session_id}`,
          form.getValues("email"),
        );
        window.location.href = `/auth/${session.session_id}/verify-email`;
      } else {
        toast.error("An unexpected response was received.");
      }
    },
    onError: (err: unknown) => {
      toast.error(
        getServerError(
          err,
          "Failed to sign in. Please check your credentials.",
        ),
      );
    },
  });

  const onSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };

  if (!session) return null;

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

            <div className="pt-3">
              <Button
                type="submit"
                className="w-full h-10 text-[15px] rounded-xl font-medium"
                isLoading={loginMutation.isPending}
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
    </div>
  );
}
