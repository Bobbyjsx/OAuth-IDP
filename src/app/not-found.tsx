import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 font-sans">
      <div className="w-full max-w-[400px] ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-left relative overflow-hidden">
        {/* Structural signature: stark top indicator line */}
        <div className="absolute left-0 top-0 w-full h-[3px] bg-zinc-900 dark:bg-zinc-100" />

        <div className="mb-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 font-medium">
            HTTP 404
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        <h1 className="text-xl font-medium tracking-tight-editorial text-zinc-900 dark:text-zinc-100 mb-3">
          Page Not Found
        </h1>

        <p className="text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400 mb-8">
          The requested route or authentication session could not be located.
          Ensure the URL is correct or restart your request from the original
          application.
        </p>

        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-[14px] font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Return to root
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
