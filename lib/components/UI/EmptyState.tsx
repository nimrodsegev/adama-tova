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
  // Empty state container using CSS variables
  emptyStateContainer: {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "var(--spacing-md) var(--spacing-lg)", // 12px 16px
    gap: "var(--spacing-md)", // 12px
    width: "100%",
    maxWidth: "22.0625rem", // 353px
    minHeight: "11.625rem", // 186px
    background: "var(--color-background)",
    border: "0.0625rem solid var(--color-text-secondary)",
    borderRadius: "var(--radius-md)",
  },

  // Icon container using CSS variables
  iconContainer: {
    width: "var(--icon-size-md)", // 71px
    height: "var(--icon-size-md-height)", // 72px
    flex: "none",
    flexGrow: 0,
  },

  // Message text using CSS variables
  messageText: {
    width: "100%",
    maxWidth: "22.0625rem", // 353px
    fontFamily: "var(--font-secondary)",
    fontStyle: "normal",
    fontWeight: "var(--font-weight-normal)",
    fontSize: "var(--font-size-xl)", // 20px
    lineHeight: "var(--font-size-xl)", // 20px
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    textAlign: "center",
    color: "var(--color-text-tertiary)", // rgba(255, 245, 245, 0.7)
    flex: "none",
    flexGrow: 0,
    margin: 0,
  },

  // Button container
  buttonContainer: {
    flex: "none",
    flexGrow: 0,
  },
};
