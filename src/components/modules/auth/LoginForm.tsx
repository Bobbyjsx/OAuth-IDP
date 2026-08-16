"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthSession } from "@/components/modules/auth-session-provider";
import { oauthApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { session } = useAuthSession();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) => oauthApi.login(session.session_id, values),
    onSuccess: (data: any) => {
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else if (data.detail === "email_verification_required") {
        window.location.href = `/auth/${session.session_id}/verify-email?email=${encodeURIComponent(form.getValues("email"))}`;
      } else {
        setError("An unexpected response was received.");
      }
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to sign in. Please check your credentials.");
      }
    },
  });

  const onSubmit = (values: LoginValues) => {
    setError(null);
    loginMutation.mutate(values);
  };

  return (
    <div className="w-full relative">
      <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-label-md text-on-surface dark:text-zinc-100 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="name@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-[13px] text-red-500 font-medium">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-label-md text-on-surface dark:text-zinc-100 font-medium">Password</Label>
              <Link 
                href={`/auth/${session.session_id}/forgot-password`}
                className="text-label-md text-gray-medium hover:text-on-surface dark:hover:text-zinc-100 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-[13px] text-red-500 font-medium">{form.formState.errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 mt-4">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          <div className="pt-3">
            <Button 
              type="submit" 
              className="w-full h-12 text-[15px] rounded-xl font-medium" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending && (
                <Loader2 className="mr-2 h-[18px] w-[18px] animate-spin" />
              )}
              Continue
            </Button>
          </div>
        </form>
      </div>
      {session.application.allow_signup && (
        <p className="text-body-md text-gray-medium dark:text-zinc-400 mt-8 text-center">
          No account yet?{" "}
          <Link 
            href={`/auth/${session.session_id}/signup`}
            className="text-on-surface dark:text-zinc-100 font-medium underline-offset-4 transition-colors duration-200 hover:underline"
          >
            Create one
          </Link>
        </p>
      )}
    </div>
  );
}
