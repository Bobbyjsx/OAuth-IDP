import { api } from "@/lib/axios";
import type { OAuthFlowResponse, OAuthRedirectResponse } from "@/types/oauth";
import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { authSessionQueryKeys } from "./auth-session";

export type VerificationResponse = OAuthRedirectResponse | OAuthFlowResponse;

export async function verifyEmail(
  sessionId: string,
  verification_token: string,
): Promise<VerificationResponse> {
  const { data } = await api.post<VerificationResponse>(
    `/api/v1/auth-sessions/${sessionId}/verify-email`,
    { verification_token },
  );
  return data;
}

export async function resendOtp(sessionId: string): Promise<{ detail: string }> {
  const { data } = await api.post<{ detail: string }>(
    `/api/v1/auth-sessions/${sessionId}/resend-otp`,
  );
  return data;
}

export function useVerifyEmail(
  sessionId: string,
  options?: UseMutationOptions<VerificationResponse, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (verificationToken: string) => verifyEmail(sessionId, verificationToken),
    onSettled: (...args) => {
      if (sessionId) {
        queryClient.invalidateQueries({
          queryKey: authSessionQueryKeys.detail(sessionId),
        });
      }
      options?.onSettled?.(...args);
    },
  });
}

export function useResendOtp(
  sessionId: string,
  options?: UseMutationOptions<{ detail: string }, Error, void>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: () => resendOtp(sessionId),
    onSettled: (...args) => {
      if (sessionId) {
        queryClient.invalidateQueries({
          queryKey: authSessionQueryKeys.detail(sessionId),
        });
      }
      options?.onSettled?.(...args);
    },
  });
}
