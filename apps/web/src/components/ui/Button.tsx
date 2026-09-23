import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Button({
  className,
  variant = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "danger" | "ghost";
}) {
  return (
    <button
      className={cn(
        variant === "secondary" && "secondary",
        variant === "danger" && "danger",
        variant === "ghost" && "secondary",
        className,
      )}
      {...props}
    />
  );
}
