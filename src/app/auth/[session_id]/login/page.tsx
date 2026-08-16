import { LoginForm } from "@/components/modules/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginPage() {
  return <LoginForm />;
}
