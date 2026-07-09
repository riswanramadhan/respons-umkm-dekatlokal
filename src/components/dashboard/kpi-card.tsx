import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "blue",
  helper,
  className,
  href,
  target,
  rel,
  ariaLabel,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "amber" | "red";
  helper?: string;
  className?: string;
  href?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
  ariaLabel?: string;
}) {
  const tones = {
    blue: "text-[#0255F5]",
    green: "text-[#16A34A]",
    amber: "text-[#D97706]",
    red: "text-[#DC2626]",
  };
  const card = (
    <Card
      className={cn(
        "min-h-28 transition-[border-color,box-shadow,transform,background-color] duration-200",
        href && "cursor-pointer",
        className,
      )}
    >
      <CardContent className="p-4 sm:p-[18px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-bold text-[#101828]">{label}</p>
            <p className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-[var(--text-primary)]">
              {typeof value === "number" ? (
                <AnimatedNumber value={value} />
              ) : (
                value
              )}
            </p>
            {helper ? (
              <p className="mt-1 text-xs text-[#98A2B3]">{helper}</p>
            ) : null}
          </div>
          <div className={tones[tone]}>
            <Icon className="size-[22px]" strokeWidth={2.2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel ?? label}
      className="block rounded-2xl focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]"
    >
      {card}
    </a>
  );
}
