import { api } from "@/lib/axios";
import type { AuthSessionResponse } from "@/types/oauth";
import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";

export const authSessionQueryKeys = {
  all: ["auth-session"] as const,
  detail: (sessionId: string) => ["auth-session", sessionId] as const,
};

export async function getSession(sessionId: string): Promise<AuthSessionResponse> {
  const { data } = await api.get<AuthSessionResponse>(`/api/v1/auth-sessions/${sessionId}`);
  return data;
}

export type CancelSessionResponse = {
  session_id: string;
  status: string;
  redirect_url: string;
};

export async function cancelSession(sessionId: string): Promise<CancelSessionResponse> {
  const { data } = await api.post<CancelSessionResponse>(
    `/api/v1/auth-sessions/${sessionId}/cancel`,
  );
  return data;
}

export function useCancelSession(
  sessionId: string,
  options?: UseMutationOptions<CancelSessionResponse, Error, void>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: () => cancelSession(sessionId),
    onSuccess: (...args) => {
      const [data] = args;
      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
      }
      options?.onSuccess?.(...args);
    },
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
