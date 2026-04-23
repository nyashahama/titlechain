function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function stringToColor(str: string): string {
  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
    "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
    "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  const color = stringToColor(name);
  return (
    <div
      className="inline-flex items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    >
      {getInitials(name)}
    </div>
  );
}
