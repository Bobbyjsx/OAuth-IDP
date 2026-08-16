import { SignupForm } from "@/components/modules/auth/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function SignupPage() {
  return <SignupForm />;
}
