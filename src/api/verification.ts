import { api } from "@/lib/axios";
import type { OAuthFlowResponse, OAuthRedirectResponse } from "@/types/oauth";

export async function verifyEmail(
  sessionId: string,
  verification_token: string
): Promise<OAuthRedirectResponse | OAuthFlowResponse> {
  const { data } = await api.post<OAuthRedirectResponse | OAuthFlowResponse>(
    `/api/v1/auth-sessions/${sessionId}/verify-email`,
    { verification_token }
  );
  return data;
}

export async function resendOtp(sessionId: string): Promise<{ detail: string }> {
  const { data } = await api.post<{ detail: string }>(
    `/api/v1/auth-sessions/${sessionId}/resend-otp`
  );
  return data;
}
