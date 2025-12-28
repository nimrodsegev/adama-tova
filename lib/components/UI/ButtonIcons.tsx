import { CSSProperties } from "react";

const iconStyle: CSSProperties = {
  border: "0.0625rem solid currentColor",
};

// Plus icon (Add)
export function PlusIcon({ color = "#681F02" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {/* Horizontal line */}
      <line
        x1="5.65"
        y1="10"
        x2="14.35"
        y2="10"
        stroke={color}
        strokeWidth="1"
      />
      {/* Vertical line */}
      <line
        x1="10"
        y1="5.65"
        x2="10"
        y2="14.35"
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  );
}

// Minus icon (Remove)
export function MinusIcon({ color = "#681F02" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {/* Horizontal line only */}
      <line
        x1="5.65"
        y1="10"
        x2="14.35"
        y2="10"
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  );
}

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

// X icon (Close/Cancel)
export function CloseIcon({ color = "#F9F9F9" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {/* First diagonal line */}
      <line x1="5" y1="5" x2="15" y2="15" stroke={color} strokeWidth="1" />
      {/* Second diagonal line */}
      <line x1="15" y1="5" x2="5" y2="15" stroke={color} strokeWidth="1" />
    </svg>
  );
}
