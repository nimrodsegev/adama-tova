import { CSSProperties, ReactNode } from "react";
import Link from "next/link";

// Button variant styles using CSS variables
const buttonVariants: { [key: string]: CSSProperties } = {
  // Button S - Small circular (44x44px)
  S: {
    width: "var(--button-size-s)",
    height: "var(--button-size-s)",
    minWidth: "var(--button-size-s)",
    minHeight: "var(--button-size-s)",
    background: "var(--button-bg)",
    borderRadius: "var(--button-radius)",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.3125rem", // 5px
    gap: "var(--spacing-sm)", // 10px
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    flexShrink: 0,
    transition: "all var(--transition-normal)",
  },

  // Button M - Medium (117x44px)
  M: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.25rem var(--spacing-lg)", // 4px 16px
    gap: "var(--spacing-sm)", // 10px
    width: "var(--button-size-m-width)",
    height: "var(--button-size-m-height)",
    background: "var(--button-bg)",
    borderRadius: "var(--button-radius)",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all var(--transition-normal)",
    flexShrink: 0,
  },

  // Icon button - Small circular for icons (44x44px)
  icon: {
    width: "var(--button-size-icon)",
    height: "var(--button-size-icon)",
    minWidth: "1.75rem", // 28px min
    minHeight: "1.75rem", // 28px min
    background: "var(--button-bg)",
    borderRadius: "var(--button-radius-full)",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "0",
    cursor: "pointer",
    textDecoration: "none",
    flexShrink: 0,
    transition: "all var(--transition-normal)",
    boxShadow: "var(--shadow-sm)",
  },
};

// Text styles using CSS variables
const textStyle: CSSProperties = {
  fontFamily: "var(--font-secondary)",
  fontStyle: "normal",
  fontWeight: "var(--font-weight-normal)",
  fontSize: "var(--font-size-sm)", // 14px
  lineHeight: "var(--font-size-xl)", // 20px
  textAlign: "center",
  color: "var(--button-text)",
  flex: "none",
  order: 0,
  flexGrow: 0,
};

// Button Props
interface ButtonProps {
  children: ReactNode;
  size?: "S" | "M" | "icon";
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  disabled?: boolean;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  size = "M",
  onClick,
  href,
  disabled = false,
  style,
  type = "button",
}: ButtonProps) {
  const buttonStyle: CSSProperties = {
    ...buttonVariants[size],
    ...(disabled && {
      opacity: 0.5,
      cursor: "not-allowed",
      pointerEvents: "none",
    }),
    ...style,
  };

  // For icon size, don't wrap in span with text styles
  const content =
    typeof children === "string" && size !== "icon" ? (
      <span style={textStyle}>{children}</span>
    ) : (
      children
    );

  // Render as Link if href is provided
  if (href && !disabled) {
    return (
      <Link href={href} style={buttonStyle}>
        {content}
      </Link>
    );
  }

  // Render as button
  return (
    <button
      type={type}
      onClick={onClick}
      style={buttonStyle}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
