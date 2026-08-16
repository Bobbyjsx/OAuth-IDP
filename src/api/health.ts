import { api } from "@/lib/axios";

export const healthQueryKeys = {
  all: ["health"] as const,
};

export async function checkHealth(): Promise<{ status: string } | unknown> {
  const { data } = await api.get("/health");
  return data;
}
