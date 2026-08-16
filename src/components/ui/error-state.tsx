export function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-left">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-500 font-medium">
          Authentication Exception
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
      </div>

      <h2 className="text-xl font-medium tracking-tight-editorial text-zinc-900 dark:text-zinc-100 mb-3">
        {title}
      </h2>

      <p className="text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  );
}
