import { ForgotPasswordForm } from "@/components/modules/auth/ForgotPasswordForm";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ transaction_id: string }>;
}) {
  return <ForgotPasswordForm />;
}
