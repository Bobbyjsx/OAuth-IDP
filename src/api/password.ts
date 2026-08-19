import { api } from "@/lib/axios";
import type { OAuthFlowResponse } from "@/types/oauth";
import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { authSessionQueryKeys } from "./auth-session";

export interface ForgotPasswordBody {
  email: string;
  turnstile_token?: string;
}

export async function forgotPassword(
  sessionId: string,
  body: ForgotPasswordBody,
): Promise<OAuthFlowResponse> {
  const { data } = await api.post<OAuthFlowResponse>(
    `/api/v1/auth-sessions/${sessionId}/forgot-password`,
    body,
  );
  return data;
}

export async function resetPassword(
  sessionId: string,
  credentials: Record<string, string>,
): Promise<OAuthFlowResponse> {
  const { data } = await api.post<OAuthFlowResponse>(
    `/api/v1/auth-sessions/${sessionId}/reset-password`,
    credentials,
  );
  return data;
}

export function useForgotPassword<TVariables = ForgotPasswordBody>(
  sessionId: string,
  options?: UseMutationOptions<OAuthFlowResponse, Error, TVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (body: TVariables) =>
      forgotPassword(sessionId, body as unknown as ForgotPasswordBody),
    onSettled: (...args) => {
      options?.onSettled?.(...args);
    },
  });
}

export function useResetPassword<TVariables = Record<string, string>>(
  sessionId: string,
  options?: UseMutationOptions<OAuthFlowResponse, Error, TVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (credentials: TVariables) =>
      resetPassword(sessionId, credentials as Record<string, string>),
    onSettled: (...args) => {
      options?.onSettled?.(...args);
    },
  });
}

export async function exchangeResetToken(reset_token: string): Promise<{ session_id: string }> {
  const { data } = await api.post<{ session_id: string }>(
    `/api/v1/auth/password/exchange-reset-token`,
    { reset_token },
  );
  return data;
}

export function useExchangeResetToken(
  options?: UseMutationOptions<{ session_id: string }, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (reset_token: string) => exchangeResetToken(reset_token),
    onSettled: (...args) => {
      options?.onSettled?.(...args);
    },
  });
}
