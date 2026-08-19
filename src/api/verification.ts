import { api } from "@/lib/axios";
import type { OAuthFlowResponse, OAuthRedirectResponse } from "@/types/oauth";
import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";

export type VerificationResponse = OAuthRedirectResponse | OAuthFlowResponse;

export interface VerifyEmailBody {
  verification_token: string;
  turnstile_token?: string;
}

export interface ResendOtpBody {
  turnstile_token?: string;
}

export async function verifyEmail(
  sessionId: string,
  body: VerifyEmailBody,
): Promise<VerificationResponse> {
  const { data } = await api.post<VerificationResponse>(
    `/api/v1/auth-sessions/${sessionId}/verify-email`,
    body,
  );
  return data;
}

export async function resendOtp(
  sessionId: string,
  body: ResendOtpBody,
): Promise<{ detail: string }> {
  const { data } = await api.post<{ detail: string }>(
    `/api/v1/auth-sessions/${sessionId}/resend-otp`,
    body,
  );
  return data;
}

export function useVerifyEmail<TVariables = VerifyEmailBody>(
  sessionId: string,
  options?: UseMutationOptions<VerificationResponse, Error, TVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (body: TVariables) => verifyEmail(sessionId, body as unknown as VerifyEmailBody),
    onSettled: (...args) => {
      options?.onSettled?.(...args);
    },
  });
}

export function useResendOtp<TVariables = ResendOtpBody>(
  sessionId: string,
  options?: UseMutationOptions<{ detail: string }, Error, TVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (body: TVariables) => resendOtp(sessionId, body as unknown as ResendOtpBody),
    onSettled: (...args) => {
      options?.onSettled?.(...args);
    },
  });
}
