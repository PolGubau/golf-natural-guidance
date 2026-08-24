import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/cn";

export function Brand({
  compact = false,
  light = false,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <Link
      href="/booking"
      className={cn(
        "inline-flex items-center gap-3 font-semibold tracking-tight",
        light ? "text-white" : "text-ink",
      )}
    >
      <Image
        src="/logo-natural-guidance.png"
        alt="Golf Natural Guidance"
        width={42}
        height={42}
        priority
        className="size-10 rounded-xl bg-white object-contain"
      />
      {compact ? null : (
        <span>
          <span className="block leading-none">Golf Natural</span>
          <span className="mt-1 block text-[10px] font-medium uppercase tracking-[.18em] opacity-60">
            Guidance
          </span>
        </span>
      )}
    </Link>
  );
}
