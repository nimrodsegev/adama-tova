import { CSSProperties, ReactNode } from "react";
import Link from "next/link";

// Button variant styles
const buttonVariants: { [key: string]: CSSProperties } = {
  // Button S - Small circular (44x44px)
  S: {
    width: "2.75rem", // 44px
    height: "2.75rem", // 44px
    minWidth: "2.75rem",
    minHeight: "2.75rem",
    background: "#F9F9F9",
    borderRadius: "1.5625rem", // 25px
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.3125rem", // 5px
    gap: "0.625rem", // 10px
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    flexShrink: 0,
    transition: "all 0.2s ease",
  },

  // Button M - Medium (117x44px)
  M: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.25rem 1rem", // 4px 16px
    gap: "0.625rem", // 10px
    width: "7.3125rem", // 117px
    height: "2.75rem", // 44px
    background: "#F9F9F9",
    borderRadius: "1.5625rem", // 25px
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.2s ease",
    flexShrink: 0,
  },

  // ✅ NEW: Icon button - Small circular for icons (28x28px)
  icon: {
    width: "2.75rem", // 28px
    height: "2.75rem", // 28px
    minWidth: "1.75rem",
    minHeight: "1.75rem",
    background: "#F9F9F9",
    borderRadius: "50%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "0",
    cursor: "pointer",
    textDecoration: "none",
    flexShrink: 0,
    transition: "all 0.2s ease",
    boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,0.1)",
  },
};

// Text styles
const textStyle: CSSProperties = {
  fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "0.875rem", // 14px
  lineHeight: "1.25rem", // 20px
  textAlign: "center",
  color: "#681F02",
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

  // ✅ For icon size, don't wrap in span with text styles
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
