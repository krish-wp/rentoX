"use client";

interface AlertProps {
  variant: "error" | "success";
  children: React.ReactNode;
}

export function Alert({ variant, children }: AlertProps) {
  const styles = variant === "error"
    ? "bg-red-50 border-red-200 text-red-600"
    : "bg-green-50 border-green-200 text-green-600";

  return (
    <div className={`mb-4 p-3 border rounded text-sm ${styles}`} role={variant === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
