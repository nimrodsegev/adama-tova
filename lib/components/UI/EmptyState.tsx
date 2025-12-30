import { CSSProperties } from "react";
import Button from "./Button";

interface EmptyStateProps {
  message: string;
  buttonText?: string;
  buttonHref?: string;
  showIcon?: boolean;
}

export default function EmptyState({
  message,
  buttonText,
  buttonHref,
  showIcon = true,
}: EmptyStateProps) {
  return (
    <div style={styles.emptyStateContainer}>
      {/* Icon - Dashed circle with plus */}
      {showIcon && (
        <div style={styles.iconContainer}>
          <svg width="71" height="72" viewBox="0 0 71 72" fill="none">
            {/* Outer dashed circle */}
            <circle
              cx="35.5"
              cy="36"
              r="34.4"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="2.2"
              strokeDasharray="4 4"
              fill="none"
            />
            {/* Inner dashed circle */}
            <circle
              cx="35.5"
              cy="36"
              r="16.38"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="2.2"
              strokeDasharray="4 4"
              fill="none"
            />
            {/* Horizontal line (minus) */}
            <line
              x1="29.2"
              y1="36"
              x2="41.81"
              y2="36"
              stroke="rgba(255, 245, 245, 0.7)"
              strokeWidth="1"
            />
            {/* Vertical line (plus) */}
            <line
              x1="35.5"
              y1="28.09"
              x2="35.5"
              y2="43.35"
              stroke="rgba(255, 245, 245, 0.7)"
              strokeWidth="1"
            />
          </svg>
        </div>
      )}

      {/* Message */}
      <p style={styles.messageText}>{message}</p>

      {/* Optional Button */}
      {buttonText && buttonHref && (
        <div style={styles.buttonContainer}>
          <Button size="M" href={buttonHref}>
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  // Empty state container - EXACT from Figma
  emptyStateContainer: {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0.75rem 1rem", // 12px 16px
    gap: "0.75rem", // 12px
    width: "100%",
    maxWidth: "22.0625rem", // 353px
    minHeight: "11.625rem", // 186px
    background: "#F28130",
    border: "0.0625rem solid #F9F9F9", // 1px
    borderRadius: "1.25rem", // 20px
  },

  // Icon container
  iconContainer: {
    width: "4.4375rem", // 71px
    height: "4.5rem", // 72px
    flex: "none",
    flexGrow: 0,
  },

  // Message text - EXACT from Figma
  messageText: {
    width: "100%",
    maxWidth: "22.0625rem", // 353px
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "1.25rem", // 20px
    lineHeight: "1.25rem", // 20px
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center", // ✅ ADDED: Center text
    textAlign: "center",
    color: "rgba(255, 245, 245, 0.7)", // LightGreyTypo
    flex: "none",
    flexGrow: 0,
    margin: 0,
  },

  // ✅ ADDED: Button container
  buttonContainer: {
    flex: "none",
    flexGrow: 0,
  },
};
