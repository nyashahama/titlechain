import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center animate-page-enter">
      {icon && (
        <div className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center mb-5 bg-card/30">
          {icon}
        </div>
      )}
      <p className="text-[15px] text-foreground/80 mb-1.5 font-medium">{title}</p>
      {description && <p className="text-[13px] text-muted max-w-[280px]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
