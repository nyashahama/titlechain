import { TitlechainMark } from "@/app/_components/landing/shared/TitlechainMark";

interface PullquoteProps {
  name: string;
  title: string;
  children: React.ReactNode;
}

export function Pullquote({ name, title, children }: PullquoteProps) {
  return (
    <div className="container py-16 md:py-24">
      <div className="relative mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-8 flex size-16 items-center justify-center">
          <TitlechainMark className="size-12 text-indigo-500" crossColor="currentColor" />
        </div>
        <blockquote className="text-xl font-medium text-white/80 leading-relaxed md:text-2xl">
          &ldquo;{children}&rdquo;
        </blockquote>
        <div className="mt-6">
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-white/40">{title}</p>
        </div>
      </div>
    </div>
  );
}
