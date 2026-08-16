import { AuthSessionProvider } from "@/components/modules/auth-session-provider";
import { ReactNode } from "react";

export default async function AuthSessionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ session_id: string }>;
}) {
  const { session_id } = await params;

  return (
    <AuthSessionProvider sessionId={session_id}>
      {children}
    </AuthSessionProvider>
  );
}
