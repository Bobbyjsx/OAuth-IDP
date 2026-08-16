import { api } from "@/lib/axios";
import type { OAuthFlowResponse } from "@/types/oauth";
import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { authSessionQueryKeys } from "./auth-session";

export async function forgotPassword(sessionId: string, email: string): Promise<OAuthFlowResponse> {
  const { data } = await api.post<OAuthFlowResponse>(
    `/api/v1/auth-sessions/${sessionId}/forgot-password`,
    { email },
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

export function useForgotPassword(
  sessionId: string,
  options?: UseMutationOptions<OAuthFlowResponse, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (email: string) => forgotPassword(sessionId, email),
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
      if (sessionId) {
        queryClient.invalidateQueries({
          queryKey: authSessionQueryKeys.detail(sessionId),
        });
      }
      options?.onSettled?.(...args);
    },
  });
}
