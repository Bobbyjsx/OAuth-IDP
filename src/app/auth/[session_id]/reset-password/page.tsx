import { ResetPasswordForm } from "@/components/modules/auth/ResetPasswordForm";
import { LoadingSkeleton } from "@/app/auth/[session_id]/LoadingSkeleton";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default async function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
