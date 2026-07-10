"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <main role="alert" className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-gray-300">500</h1>
      <p className="text-xl text-gray-600 mt-4">Something went wrong</p>
      <p className="text-gray-500 mt-2">An unexpected error occurred.</p>
      <Button className="mt-6" onClick={reset}>Try Again</Button>
    </main>
  );
}
