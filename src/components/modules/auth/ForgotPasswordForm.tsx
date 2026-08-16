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

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { session } = useAuthSession();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordValues) => 
      oauthApi.forgotPassword(session.session_id, values.email),
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to process request. Please try again.");
      }
    },
  });

  const onSubmit = (values: ForgotPasswordValues) => {
    setError(null);
    mutation.mutate(values);
  };

  if (success) {
    return (
      <div className="w-full relative">
        <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-center">
          <p className="text-body-md text-gray-medium dark:text-zinc-400 font-medium mb-8 leading-relaxed">
            If an account exists for <span className="text-on-surface dark:text-zinc-100 font-semibold">{form.getValues("email")}</span>, you will receive instructions to reset your password.
          </p>
          <Link 
            href={`/auth/${session.session_id}/login`}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-[15px] font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 border border-[rgba(0,0,0,0.06)] bg-gray-light dark:bg-zinc-800 hover:bg-[#eaeaea] dark:hover:bg-zinc-700 active:scale-[0.98] h-12 px-6 py-2 w-full text-on-surface dark:text-zinc-100"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-label-md text-on-surface dark:text-zinc-100 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-[13px] text-red-500 font-medium">{form.formState.errors.email.message}</p>
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
              disabled={mutation.isPending}
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-[18px] w-[18px] animate-spin" />
              )}
              Send Reset Link
            </Button>
          </div>
        </form>
      </div>
      <p className="text-body-md text-gray-medium dark:text-zinc-400 mt-8 text-center">
        Remember your password?{" "}
        <Link 
          href={`/auth/${session.session_id}/login`}
          className="text-on-surface dark:text-zinc-100 font-medium underline-offset-4 transition-colors duration-200 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
