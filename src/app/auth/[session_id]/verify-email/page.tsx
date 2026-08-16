import { VerifyEmailForm } from "@/components/modules/auth/VerifyEmailForm";
import { LoadingSkeleton } from "@/app/auth/[session_id]/LoadingSkeleton";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default async function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
