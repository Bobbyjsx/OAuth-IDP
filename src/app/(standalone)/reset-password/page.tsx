"use client";

import { useExchangeResetToken, getServerError } from "@/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ErrorState } from "@/components/ui/error-state";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/motion";
import { LoadingSkeleton } from "@/app/auth/[session_id]/LoadingSkeleton";

export default function StandaloneResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const mounted = useRef(false);

  const { mutate: exchange, error } = useExchangeResetToken({
    onSuccess: (data) => {
      // Redirect to the session-bound reset-password page
      router.replace(`/auth/${data.session_id}/reset-password?token=${token}`);
    },
    onError: (err) => {
      toast.error(
        getServerError(err, "Failed to load application context. Link might be expired."),
      );
    },
  });

  useEffect(() => {
    if (token && !mounted.current) {
      mounted.current = true;
      exchange(token);
    }
  }, [token, exchange]);

  if (!token) {
    return (
      <div className="w-full relative">
        <motion.div
          variants={itemVariants}
          className="ambient-shadow rounded-xl border border-[rgba(0,0,0,0.06)] bg-white dark:bg-zinc-900 p-8 md:p-10 text-center"
        >
          <p className="text-body-md text-gray-medium dark:text-zinc-400 font-medium mb-8 leading-relaxed">
            The password reset link is missing a required token.
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full relative">
        <motion.div variants={itemVariants}>
          <ErrorState
            title="Invalid Link"
            message={getServerError(
              error,
              "Failed to load application context. The link might be expired or invalid.",
            )}
          />
        </motion.div>
      </div>
    );
  }

  return <LoadingSkeleton />;
}
