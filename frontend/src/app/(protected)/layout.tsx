import type { Metadata } from "next";
import ProtectedRoute from "@/components/protected-route";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </ProtectedRoute>
  );
}
