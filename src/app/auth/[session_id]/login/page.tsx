import { LoginForm } from "@/components/modules/auth/LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ transaction_id: string }>;
}) {
  return <LoginForm />;
}
