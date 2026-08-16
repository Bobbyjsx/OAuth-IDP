export const LoadingSkeleton = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 flex flex-col items-center justify-center space-y-4">
          <div className="h-10 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="h-10 w-full rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
              <div className="h-10 w-full rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            </div>
            <div className="pt-3">
              <div className="h-10 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
