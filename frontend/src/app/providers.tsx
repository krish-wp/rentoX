"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "font-sans !rounded-xl",
          },
        }}
      />
    </AuthProvider>
  );
}
