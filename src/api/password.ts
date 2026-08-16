import { api } from "@/lib/axios";
import type { OAuthFlowResponse } from "@/types/oauth";

export async function forgotPassword(
  sessionId: string,
  email: string
): Promise<OAuthFlowResponse> {
  const { data } = await api.post<OAuthFlowResponse>(
    `/api/v1/auth-sessions/${sessionId}/forgot-password`,
    { email }
  );
  return data;
}

export async function resetPassword(
  sessionId: string,
  credentials: Record<string, string>
): Promise<OAuthFlowResponse> {
  const { data } = await api.post<OAuthFlowResponse>(
    `/api/v1/auth-sessions/${sessionId}/reset-password`,
    credentials
  );
  return data;
}
