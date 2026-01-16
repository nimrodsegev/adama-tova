"use client";
import React from "react";
import Button from "./Button";
import styles from "./Popup.module.css";

interface PopupProps {
  title?: string;
  content: string | React.ReactNode;
  userName?: string;
  email?: string;
  recommendation?: string;
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
  secondaryButtonHref?: string;
  loading?: boolean;
  onClose?: () => void;
  preview?: boolean;
}

export default function Popup({
  title,
  content,
  userName,
  email,
  recommendation,
  primaryButtonText,
  primaryButtonAction,
  primaryButtonHref,
  secondaryButtonText,
  secondaryButtonAction,
  secondaryButtonHref,
  loading = false,
  onClose,
  preview = false,
}: PopupProps) {
  const handlePrimaryClick = () => {
    if (primaryButtonAction) {
      primaryButtonAction();
    }
    if (primaryButtonHref) {
      window.location.href = primaryButtonHref;
    }
  };

  const handleSecondaryClick = () => {
    if (secondaryButtonAction) {
      secondaryButtonAction();
    }
    if (secondaryButtonHref) {
      window.location.href = secondaryButtonHref;
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // Preview mode - just the modal without overlay
  if (preview) {
    return (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          {title && <h2 className={styles.title}>{title}</h2>}

          <div className={styles.messageContainer}>
            {userName && <p className={styles.userName}>{userName}</p>}

            {typeof content === "string" ? (
              <p className={styles.message}>{content}</p>
            ) : (
              content
            )}

            {email && <p className={styles.email}>{email}</p>}

            {recommendation && (
              <p className={styles.recommendation}>{recommendation}</p>
            )}
          </div>

          {(primaryButtonText || secondaryButtonText) && (
            <div className={styles.buttons}>
              {secondaryButtonText && (
                <Button variant="reject" onClick={handleSecondaryClick}>
                  {secondaryButtonText}
                </Button>
              )}

              {primaryButtonText && (
                <Button
                  variant="approve"
                  onClick={handlePrimaryClick}
                  disabled={loading}
                  customBorderColor={"var(--color-white-pure)"}
                >
                  {loading ? "טוען..." : primaryButtonText}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full mode - with overlay
  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          {title && <h2 className={styles.title}>{title}</h2>}

          <div className={styles.messageContainer}>
            {userName && <p className={styles.userName}>{userName}</p>}

            {typeof content === "string" ? (
              <p className={styles.message}>{content}</p>
            ) : (
              content
            )}

            {email && <p className={styles.email}>{email}</p>}

            {recommendation && (
              <p className={styles.recommendation}>{recommendation}</p>
            )}
          </div>

          {(primaryButtonText || secondaryButtonText) && (
            <div className={styles.buttons}>
              {secondaryButtonText && (
                <Button variant="reject" onClick={handleSecondaryClick}>
                  {secondaryButtonText}
                </Button>
              )}

              {primaryButtonText && (
                <Button
                  variant="approve"
                  onClick={handlePrimaryClick}
                  disabled={loading}
                  customBorderColor={"var(--color-white-pure)"}
                >
                  {loading ? "טוען..." : primaryButtonText}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
