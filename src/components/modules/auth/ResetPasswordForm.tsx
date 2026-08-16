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
import { useSearchParams } from "next/navigation";
import { AxiosError } from "axios";

const resetPasswordSchema = z.object({
  new_password: z.string().min(8, "Password must be at least 8 characters."),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const { session } = useAuthSession();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordValues) => 
      oauthApi.resetPassword(session.session_id, {
        reset_token: token || "",
        new_password: values.new_password
      }),
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to reset password. The link might be expired or invalid.");
      }
    },
  });

  const onSubmit = (values: ResetPasswordValues) => {
    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
      return;
    }
    setError(null);
    mutation.mutate(values);
  };

  if (!token) {
    return (
      <div className="w-full relative">
        <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-center">
          <p className="text-body-md text-gray-medium dark:text-zinc-400 font-medium mb-8 leading-relaxed">
            The password reset link is missing a required token.
          </p>
          <Link 
            href={`/auth/${session.session_id}/forgot-password`}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-[15px] font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 border border-[rgba(0,0,0,0.06)] bg-gray-light dark:bg-zinc-800 hover:bg-[#eaeaea] dark:hover:bg-zinc-700 active:scale-[0.98] h-12 px-6 py-2 w-full text-on-surface dark:text-zinc-100"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full relative">
        <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-center">
          <p className="text-body-md text-gray-medium dark:text-zinc-400 font-medium mb-8 leading-relaxed">
            Your password has been successfully reset.
          </p>
          <Link 
            href={`/auth/${session.session_id}/login`}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-[15px] font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 h-12 px-6 py-2 w-full"
          >
            Sign in with new password
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
            <Label htmlFor="new_password" className="text-label-md text-on-surface dark:text-zinc-100 font-medium">New Password</Label>
            <Input
              id="new_password"
              type="password"
              autoComplete="new-password"
              {...form.register("new_password")}
            />
            {form.formState.errors.new_password && (
              <p className="text-[13px] text-red-500 font-medium">{form.formState.errors.new_password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-label-md text-on-surface dark:text-zinc-100 font-medium">Confirm Password</Label>
            <Input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              {...form.register("confirm_password")}
            />
            {form.formState.errors.confirm_password && (
              <p className="text-[13px] text-red-500 font-medium">{form.formState.errors.confirm_password.message}</p>
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
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
