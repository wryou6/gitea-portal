import type { ReactNode } from "react";
export function Alert({
  children,
  variant = "error",
}: {
  children: ReactNode;
  variant?: "error" | "warning" | "success";
}) {
  return (
    <div
      className={
        variant === "error"
          ? "error"
          : variant === "warning"
            ? "permission"
            : "loading"
      }
      role={variant === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
