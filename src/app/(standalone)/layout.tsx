import { ReactNode } from "react";
import { Metadata } from "next";

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
          {/* Default branding for standalone pages */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-4">
            <span className="font-semibold text-lg text-zinc-900 dark:text-white">ID</span>
          </div>
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
