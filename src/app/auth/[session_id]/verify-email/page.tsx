import { VerifyEmailForm } from "@/components/modules/auth/VerifyEmailForm";
import { Suspense } from "react";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ transaction_id: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
