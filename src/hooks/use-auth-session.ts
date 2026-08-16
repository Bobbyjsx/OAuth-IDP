import { oauthApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useParams, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useAuthSession() {
  const params = useParams();
  const pathname = usePathname();
  const sessionId = params.session_id as string;

  const query = useQuery({
    queryKey: ["auth-session", sessionId],
    queryFn: () => oauthApi.getSession(sessionId),
    enabled: !!sessionId,
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (sessionId) {
      query.refetch();
    }
  }, [pathname, sessionId, query.refetch]);

  return {
    session: query.data,
    sessionId,
    ...query,
  };
}
