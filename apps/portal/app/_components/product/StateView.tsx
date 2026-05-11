import type { ReactNode } from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/app/_lib/cn";

const iconByKind = {
  empty: Inbox,
  error: AlertCircle,
  loading: Loader2,
};

export function StateView({
  kind,
  title,
  description,
  action,
  className,
}: {
  kind: "empty" | "error" | "loading";
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  const Icon = iconByKind[kind];
  return (
    <div className={cn("flex min-h-[18rem] flex-col items-center justify-center text-center", className)}>
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-tc-border bg-tc-surface-subtle">
        <Icon className={cn("size-5 text-tc-text-muted", kind === "loading" && "animate-spin")} />
      </div>
      <p className="text-sm font-medium text-tc-text">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-[13px] text-tc-text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
