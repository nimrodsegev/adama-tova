"use client";

import React, { useState, useEffect } from "react";
import styles from "./NewNotificationCard.module.css";
import Button from "@/lib/components/UI/Button";
import { useIvrita } from "@/app/contexts/IvritaContext";

export interface NotificationProps {
  id: string | number;
  title: string;
  message: string;
  timestamp: string | Date;
  isRead: boolean;
  activityId?: string;
}

interface NewNotificationCardProps {
  notification: NotificationProps;
  onMarkAsRead?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onActivityClick?: (activityId: string) => void;
  showMarkAsReadHint?: boolean;
  showDeleteHint?: boolean;
}

export default function NewNotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  onActivityClick,
  showMarkAsReadHint = false,
  showDeleteHint = false,
}: NewNotificationCardProps) {
  const { t } = useIvrita();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [isHintAnimating, setIsHintAnimating] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);

  // Swipe hint animation - peek to show users they can swipe
  useEffect(() => {
    const shouldShowMarkAsRead = showMarkAsReadHint && !notification.isRead;
    const shouldShowDelete = showDeleteHint;

    if (!shouldShowMarkAsRead && !shouldShowDelete) return;

    const PEEK_MS = 1000; // Must match CSS transition duration
    const HOLD_MS = 300; // Small pause at max peek position

    const timeouts: NodeJS.Timeout[] = [];
    let currentDelay = 4000; // Initial delay - 4 seconds to let user see the page

    // First: Show mark as read hint (if applicable)
    if (shouldShowMarkAsRead) {
      const peekTimeout = setTimeout(() => {
        setIsPeeking(true);
        setIsHintAnimating(true);
        setSwipeDirection("left");

        // Apply offset after two frames to ensure CSS class is fully applied
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setOffset(-120);
          });
        });

        // Return to center after peek + hold
        const returnTimeout = setTimeout(() => {
          setOffset(0);

          // Cleanup after return animation completes
          const cleanupTimeout = setTimeout(() => {
            setSwipeDirection(null);
            setIsPeeking(false);
            setIsHintAnimating(false);
          }, PEEK_MS);
          timeouts.push(cleanupTimeout);
        }, PEEK_MS + HOLD_MS);
        timeouts.push(returnTimeout);
      }, currentDelay);
      timeouts.push(peekTimeout);
      currentDelay += PEEK_MS * 2 + HOLD_MS + 300; // Wait for full animation cycle
    }

    // Second: Show delete hint (if applicable)
    if (shouldShowDelete) {
      const deleteHintTimeout = setTimeout(() => {
        setIsPeeking(true);
        setIsHintAnimating(true);
        setSwipeDirection("right");

        // Apply offset after two frames to ensure CSS class is fully applied
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setOffset(120);
          });
        });

        // Return to center after peek + hold
        const returnTimeout = setTimeout(() => {
          setOffset(0);

          // Cleanup after return animation completes
          const cleanupTimeout = setTimeout(() => {
            setSwipeDirection(null);
            setIsPeeking(false);
            setIsHintAnimating(false);
          }, PEEK_MS);
          timeouts.push(cleanupTimeout);
        }, PEEK_MS + HOLD_MS);
        timeouts.push(returnTimeout);
      }, currentDelay);
      timeouts.push(deleteHintTimeout);
    } else {
      // Safety cleanup if only mark-as-read hint is shown
      const cleanupTimeout = setTimeout(() => {
        setIsHintAnimating(false);
        setIsPeeking(false);
        setSwipeDirection(null);
        setOffset(0);
      }, currentDelay);
      timeouts.push(cleanupTimeout);
    }

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [showMarkAsReadHint, showDeleteHint, notification.isRead]);

  const minSwipeDistance = 50;
  const maxSwipeOffset = -120; // Match action box width (7.5rem ≈ 120px)
  const maxDeleteOffset = 120; // Positive for right swipe (delete)

  const formatTime = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiped(false);
    setSwipeDirection(null);
    setIsPeeking(false); // Exit peek mode so real swipes are instant
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;

    // Left swipe (negative) - mark as read (only for unread)
    if (diff < 0 && !notification.isRead) {
      setOffset(Math.max(diff, maxSwipeOffset));
      setSwipeDirection("left");
    }
    // Right swipe (positive) - delete
    else if (diff > 0) {
      setOffset(Math.min(diff, maxDeleteOffset));
      setSwipeDirection("right");
    }
    setTouchEnd(currentTouch);
  };

  const onTouchEnd = () => {
    setIsDragging(false);

    if (!touchStart || !touchEnd) {
      setOffset(0);
      setSwipeDirection(null);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Left swipe - mark as read
    if (isLeftSwipe && onMarkAsRead && !notification.isRead) {
      setOffset(maxSwipeOffset);
      setIsSwiped(true);

      setTimeout(() => {
        onMarkAsRead(notification.id);
        setOffset(0);
        setIsSwiped(false);
        setSwipeDirection(null);
      }, 500);
    }
    // Right swipe - delete
    else if (isRightSwipe && onDelete) {
      setOffset(maxDeleteOffset);
      setIsSwiped(true);

      setTimeout(() => {
        onDelete(notification.id);
        setOffset(0);
        setIsSwiped(false);
        setSwipeDirection(null);
      }, 500);
    } else {
      setOffset(0);
      setSwipeDirection(null);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Divider line only shows when swiping/peeking
  const dividerClass =
    swipeDirection === "left"
      ? styles.showRightDivider
      : swipeDirection === "right"
      ? styles.showLeftDivider
      : "";

  // Helper class for read state font weight
  const readTextClass = notification.isRead ? styles.readText : "";

  return (
    <div className={`${styles.container} ${isPeeking ? styles.peek : ""}`}>
      {/* RIGHT SIDE - Mark as Read (shows when swiping left) */}
      {swipeDirection === "left" && (
        <div className={styles.revealMask} style={{ width: Math.abs(offset) }}>
          <div className={styles.swipeActionBox}>
            <span className={styles.swipeText}>
              {t("[סמן|סמני]")}
              <br />
              כנקרא
            </span>
            <div className={styles.swipeArrow}>
              <svg
                width="8"
                height="14"
                viewBox="0 0 8 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.arrowIcon}
              >
                <path
                  d="M7 1L1 7L7 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDE - Delete (shows when swiping right) */}
      {swipeDirection === "right" && (
        <div
          className={styles.deleteRevealMask}
          style={{ width: Math.abs(offset) }}
        >
          <div className={styles.deleteActionBox}>
            <span className={styles.deleteText}>{t("[מחק|מחקי]")}</span>
            <div className={styles.deleteArrow}>
              <svg
                width="8"
                height="14"
                viewBox="0 0 8 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.arrowIcon}
              >
                <path
                  d="M1 1L7 7L1 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* FOREGROUND CARD (Slides Left or Right) */}
      <div
        className={`${styles.card} ${
          isHintAnimating ? styles.hintAnimating : ""
        } ${isDragging ? styles.dragging : ""} ${dividerClass}`}
        style={{
          transform: `translateX(${offset}px)`,
          opacity: isSwiped ? 0.7 : 1,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* HEADER */}
        <div className={styles.header}>
          {!notification.isRead && <div className={styles.unreadDot} />}

          <div className={styles.headerTextGroup}>
            <span className={`${styles.time} ${readTextClass}`}>
              {formatTime(notification.timestamp)}
            </span>
            <span className={`${styles.pipe} ${readTextClass}`}>|</span>
            <span className={`${styles.title} ${readTextClass}`}>
              {notification.title}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.messageContent}>{notification.message}</div>

        {/* BUTTON */}
        {notification.activityId && (
          <div className={styles.buttonPositioner}>
            <Button
              variant="tertiary"
              colorType="white"
              tertiarySize="medium"
              tertiaryWeight="semibold"
              onClick={(e) => {
                e.stopPropagation();
                if (onActivityClick) onActivityClick(notification.activityId!);
              }}
            >
              לפעילות
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
