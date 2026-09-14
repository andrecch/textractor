import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SegmentedSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  leftContent: ReactNode;
  rightContent: ReactNode;
  "aria-label"?: string;
  className?: string;
}

export function SegmentedSwitch({
  checked,
  onCheckedChange,
  leftContent,
  rightContent,
  "aria-label": ariaLabel,
  className,
}: SegmentedSwitchProps) {
  const [displayChecked, setDisplayChecked] = useState(checked);

  useEffect(() => {
    if (checked === displayChecked) return;
    const id = requestAnimationFrame(() => setDisplayChecked(checked));
    return () => cancelAnimationFrame(id);
  }, [checked, displayChecked]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-8 w-[84px] shrink-0 cursor-pointer rounded-lg border outline-none transition-colors",
        "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30",
        displayChecked
          ? "border-primary/25 bg-primary/15"
          : "border-input bg-input/40",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-[2px] left-[2px] h-[26px] w-[38px] rounded-md bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-transform duration-200 ease-out",
          displayChecked ? "translate-x-[40px]" : "translate-x-0"
        )}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 flex select-none items-center text-xs font-medium"
      >
        <span className="flex h-full w-1/2 items-center justify-center">
          <span
            className={cn(
              "transition-colors",
              displayChecked ? "text-muted-foreground" : "text-neutral-900"
            )}
          >
            {leftContent}
          </span>
        </span>
        <span className="flex h-full w-1/2 items-center justify-center">
          <span
            className={cn(
              "transition-colors",
              displayChecked ? "text-neutral-900" : "text-muted-foreground"
            )}
          >
            {rightContent}
          </span>
        </span>
      </span>
    </button>
  );
}
