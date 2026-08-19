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
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
      <div className="w-full max-w-[380px] z-10">
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-medium dark:text-zinc-400 text-body-md leading-relaxed">
            Choose a new password for your account.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
