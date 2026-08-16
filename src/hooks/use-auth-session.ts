import { oauthApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function useAuthSession() {
  const params = useParams();
  const sessionId = params.session_id as string;

  const query = useQuery({
    queryKey: ["auth-session", sessionId],
    queryFn: () => oauthApi.getSession(sessionId),
    enabled: !!sessionId,
    retry: false,
    // Keep data fresh for 30s — avoids re-fetching on every mount within the
    // same page, while still re-validating when the user returns to the tab.
    staleTime: 30_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    session: query.data,
    sessionId,
    ...query,
  };
}
