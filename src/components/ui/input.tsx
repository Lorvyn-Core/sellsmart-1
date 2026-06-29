import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-none h-11 w-full min-w-0 rounded-xl bg-slate-50 px-4 py-1 text-base shadow-sm transition-all outline-none disabled:opacity-50 md:text-sm focus:bg-white focus:shadow-md focus:ring-2 focus:ring-emerald/20",
        className
      )}
      {...props}
    />
  );
}

export { Input };
