import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials?: string;
}

export function Avatar({ className, initials = "CA", ...props }: AvatarProps) {
  return (
    <div
      className={clsx(
        "inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white",
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
}
