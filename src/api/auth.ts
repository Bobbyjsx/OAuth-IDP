import { api } from "@/lib/axios";
import type { OAuthFlowResponse, OAuthRedirectResponse } from "@/types/oauth";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { authSessionQueryKeys } from "./auth-session";

export type AuthResponse = OAuthRedirectResponse | OAuthFlowResponse;

export async function login(
  sessionId: string,
  credentials: Record<string, string>,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    `/api/v1/auth-sessions/${sessionId}/login`,
    credentials,
  );
  return data;
}

export async function signup(
  sessionId: string,
  credentials: Record<string, string>,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    `/api/v1/auth-sessions/${sessionId}/signup`,
    credentials,
  );
  return data;
}

export function useLogin<TVariables = Record<string, string>>(
  sessionId: string,
  options?: UseMutationOptions<AuthResponse, Error, TVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (variables: TVariables) =>
      login(sessionId, variables as Record<string, string>),
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

export function useSignup<TVariables = Record<string, string>>(
  sessionId: string,
  options?: UseMutationOptions<AuthResponse, Error, TVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (variables: TVariables) =>
      signup(sessionId, variables as Record<string, string>),
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
