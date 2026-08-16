import { api } from "@/lib/axios";
import type { OAuthFlowResponse, OAuthRedirectResponse } from "@/types/oauth";

export async function login(
  sessionId: string,
  credentials: Record<string, string>
): Promise<OAuthRedirectResponse | OAuthFlowResponse> {
  const { data } = await api.post<OAuthRedirectResponse | OAuthFlowResponse>(
    `/api/v1/auth-sessions/${sessionId}/login`,
    credentials
  );
  return data;
}

export async function signup(
  sessionId: string,
  credentials: Record<string, string>
): Promise<OAuthRedirectResponse | OAuthFlowResponse> {
  const { data } = await api.post<OAuthRedirectResponse | OAuthFlowResponse>(
    `/api/v1/auth-sessions/${sessionId}/signup`,
    credentials
  );
  return data;
}
