import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Identity Service",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StandaloneLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
