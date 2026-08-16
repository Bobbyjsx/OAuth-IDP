import { SignupForm } from "@/components/modules/auth/SignupForm";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ transaction_id: string }>;
}) {
  return <SignupForm />;
}
