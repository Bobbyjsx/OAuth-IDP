import { ForgotPasswordForm } from "@/components/modules/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default async function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
