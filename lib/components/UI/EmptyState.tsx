"use client";
import React from "react";
import Image from "next/image";
import Button from "./Button";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  message: string;
  buttonText?: string;
  buttonHref?: string;
  showIcon?: boolean;
  onButtonClick?: () => void;
  iconSize?: number; // Size in pixels for the icon
  gap?: string; // Gap between elements (e.g., "var(--spacing-md)")
}

export default function EmptyState({
  message,
  buttonText,
  buttonHref,
  showIcon = true,
  onButtonClick,
  iconSize = 71, // Default size matching original
  gap = "var(--spacing-sm)", // Default gap
}: EmptyStateProps) {
  return (
    <div className={styles.emptyStateContainer} style={{ gap }}>
      {/* Icon - Using plus.svg */}
      {showIcon && (
        <div
          className={styles.iconContainer}
          style={{ width: iconSize, height: iconSize }}
        >
          <Image
            src="/icons/plus.svg"
            alt="Add icon"
            width={iconSize}
            height={iconSize}
            priority
          />
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
