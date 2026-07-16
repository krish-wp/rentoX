"use client";

interface AlertProps {
  variant: "error" | "success";
  children: React.ReactNode;
}

export function Alert({ variant, children }: AlertProps) {
  const styles = variant === "error"
    ? "bg-destructive/5 border-destructive/20 text-destructive"
    : "bg-success/5 border-success/20 text-success";

  return (
    <div className={`mb-4 px-4 py-3 border rounded-lg text-sm leading-relaxed tracking-[-0.01em] ${styles}`} role={variant === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
