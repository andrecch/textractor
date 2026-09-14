import { SegmentedSwitch } from "./SegmentedSwitch";

interface OnOffSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function OnOffSwitch({
  checked,
  onCheckedChange,
  className,
}: OnOffSwitchProps) {
  return (
    <SegmentedSwitch
      checked={checked}
      onCheckedChange={onCheckedChange}
      leftContent="OFF"
      rightContent="ON"
      className={className}
    />
  );
}
