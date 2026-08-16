import { AuthLayoutWrapper } from "@/components/modules/auth-layout-wrapper";
import { ReactNode } from "react";
import { Metadata } from "next";
import { getSession } from "@/api";

type Props = {
  params: Promise<{ session_id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

export default async function AuthSessionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthLayoutWrapper>{children}</AuthLayoutWrapper>;
}
