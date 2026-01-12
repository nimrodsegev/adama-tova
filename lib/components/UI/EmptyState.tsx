"use client";

import React from "react";
import Button from "./Button";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  message: string;
  buttonText?: string;
  buttonHref?: string;
  showIcon?: boolean;
  onButtonClick?: () => void;
}

export default function EmptyState({
  message,
  buttonText,
  buttonHref,
  showIcon = true,
  onButtonClick,
}: EmptyStateProps) {
  return (
    <div className={styles.emptyStateContainer}>
      {/* Icon - Dashed circle with plus */}
      {showIcon && (
        <div className={styles.iconContainer}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 71 72"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Outer dashed circle */}
            <circle
              cx="35.5"
              cy="36"
              r="34.4"
              stroke="var(--color-text-muted)"
              strokeWidth="2.2"
              strokeDasharray="4 4"
              fill="none"
            />
            {/* Inner dashed circle */}
            <circle
              cx="35.5"
              cy="36"
              r="16.38"
              stroke="var(--color-text-muted)"
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
              stroke="var(--color-text-tertiary)"
              strokeWidth="1"
            />
            {/* Vertical line (plus) */}
            <line
              x1="35.5"
              y1="28.09"
              x2="35.5"
              y2="43.35"
              stroke="var(--color-text-tertiary)"
              strokeWidth="1"
            />
          </svg>
        </div>
      )}

      {/* Message */}
      <p className={styles.messageText}>{message}</p>

      {/* Dynamic Button - Always Size L as requested */}
      {buttonText && (
        <div className={styles.buttonContainer}>
          <Button
            variant="primary"
            size="L"
            href={buttonHref}
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
}
