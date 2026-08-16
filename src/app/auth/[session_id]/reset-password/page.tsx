import { ResetPasswordForm } from "@/components/modules/auth/ResetPasswordForm";
import { Suspense } from "react";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ transaction_id: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
