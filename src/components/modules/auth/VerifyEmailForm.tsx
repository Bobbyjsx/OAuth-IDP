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
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { AxiosError } from "axios";

const verifyEmailSchema = z.object({
  verification_token: z.string().length(6, "Verification code must be 6 digits."),
});

type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;

export function VerifyEmailForm() {
  const { session } = useAuthSession();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  
  const [error, setError] = useState<string | null>(null);

  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      verification_token: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: VerifyEmailValues) => 
      oauthApi.verifyEmail(session.session_id, values.verification_token),
    onSuccess: (data: any) => {
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        // Fallback if no redirect is supplied, though backend should provide it on success
        window.location.href = `/auth/${session.session_id}/login`;
      }
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Invalid verification code. Please try again.");
      }
    },
  });

  const onSubmit = (values: VerifyEmailValues) => {
    setError(null);
    mutation.mutate(values);
  };

  return (
    <div className="w-full relative">
      <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10">
        <div className="mb-8 text-center">
          <p className="text-body-md text-gray-medium dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
            {emailParam 
              ? `We've sent a 6-digit code to ${emailParam}.`
              : "We've sent a 6-digit verification code to your email."}
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="verification_token" className="text-label-md text-on-surface dark:text-zinc-100 font-medium">Verification Code</Label>
            <Input
              id="verification_token"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="text-center tracking-widest text-lg font-medium"
              {...form.register("verification_token")}
            />
            {form.formState.errors.verification_token && (
              <p className="text-[13px] text-red-500 font-medium">{form.formState.errors.verification_token.message}</p>
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
              Verify Email
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
