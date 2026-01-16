import { CSSProperties } from "react";

const iconStyle: CSSProperties = {
  border: "0.0625rem solid currentColor",
};

// Arrow icon (pointing left/right)
export function ArrowIcon({
  color = "#681F02",
  direction = "left",
}: {
  color?: string;
  direction?: "left" | "right";
}) {
  return (
    <svg
      width="20"
      height="1"
      viewBox="0 0 20 1"
      fill="none"
      style={{ transform: direction === "left" ? "rotate(180deg)" : "none" }}
    >
      <line x1="0" y1="0.5" x2="20" y2="0.5" stroke={color} strokeWidth="1" />
    </svg>
  );
}
