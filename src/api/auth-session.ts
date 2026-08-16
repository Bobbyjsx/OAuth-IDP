import { api } from "@/lib/axios";
import type { AuthSessionResponse } from "@/types/oauth";

export const authSessionQueryKeys = {
  all: ["auth-session"] as const,
  detail: (sessionId: string) => ["auth-session", sessionId] as const,
};

export async function getSession(sessionId: string): Promise<AuthSessionResponse> {
  const { data } = await api.get<AuthSessionResponse>(
    `/api/v1/auth-sessions/${sessionId}`
  );
  return data;
}

export async function cancelSession(sessionId: string): Promise<{
  session_id: string;
  status: string;
  redirect_url: string;
}> {
  const { data } = await api.post<{
    session_id: string;
    status: string;
    redirect_url: string;
  }>(`/api/v1/auth-sessions/${sessionId}/cancel`);
  return data;
}
