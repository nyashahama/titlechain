export function RelativeTime({ date }: { date: string }) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  let text: string;
  if (diffSec < 60) text = "just now";
  else if (diffMin < 60) text = `${diffMin}m ago`;
  else if (diffHr < 24) text = `${diffHr}h ago`;
  else if (diffDay < 7) text = `${diffDay}d ago`;
  else if (diffDay < 30) text = `${Math.floor(diffDay / 7)}w ago`;
  else text = then.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <span className="text-[11px] text-muted-more font-mono tabular-nums" title={then.toLocaleString()}>
      {text}
    </span>
  );
}
