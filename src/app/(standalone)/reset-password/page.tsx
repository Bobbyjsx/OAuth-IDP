import { StandaloneResetPasswordForm } from "@/components/modules/auth/StandaloneResetPasswordForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function StandaloneResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="h-40 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
      }
    >
      <StandaloneResetPasswordForm />
    </Suspense>
  );
}
