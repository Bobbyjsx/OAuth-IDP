import { api } from "@/lib/axios";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export const healthQueryKeys = {
  all: ["health"] as const,
};

export async function checkHealth(): Promise<{ status: string } | unknown> {
  const { data } = await api.get("/health");
  return data;
}

export function useHealth(
  options?: Omit<UseQueryOptions<{ status: string } | unknown, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: healthQueryKeys.all,
    queryFn: checkHealth,
    retry: 1,
    refetchInterval: 30000,
    ...options,
  });
}
