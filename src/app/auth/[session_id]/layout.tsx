import { AuthLayoutWrapper } from "@/components/modules/auth-layout-wrapper";
import { ReactNode } from "react";
import { Metadata } from "next";
import { authSessionQueryKeys, getSession } from "@/api";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

type Props = {
  params: Promise<{ session_id: string }>;
  children: ReactNode;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ session_id: string }>;
}): Promise<Metadata> {
  const { session_id } = await params;
  try {
    const session = await getSession(session_id);
    const { name, description, logo_url } = session.application;

    return {
      title: name
        ? {
            default: name,
            template: `${name} | %s`,
          }
        : undefined,
      description: description || undefined,
      icons: logo_url ? { icon: logo_url as string } : undefined,
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title: name
          ? {
              default: name,
              template: `${name} | %s`,
            }
          : undefined,
        description: description || undefined,
        images: logo_url ? [{ url: logo_url as string }] : undefined,
      },
    };
  } catch {
    return {
      title: "Authentication",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function AuthSessionLayout({ children, params }: Props) {
  const { session_id } = await params;
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: authSessionQueryKeys.detail(session_id),
      queryFn: () => getSession(session_id),
    });
  } catch {
    // Client will handle error state gracefully
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthLayoutWrapper>{children}</AuthLayoutWrapper>
    </HydrationBoundary>
  );
}
