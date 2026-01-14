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
  showSwipeHint?: boolean;
}

export default function NewNotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  onActivityClick,
  showSwipeHint = false,
}: NewNotificationCardProps) {
  const { t } = useIvrita();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [isHintAnimating, setIsHintAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  // Swipe hint animation - peek to show users they can swipe
  useEffect(() => {
    if (showSwipeHint && !notification.isRead) {
      // Wait a moment, then peek
      const peekTimeout = setTimeout(() => {
        setIsHintAnimating(true);
        setOffset(-120); // Show more of the סמן כנקרא

        // Hold, then return smoothly
        setTimeout(() => {
          setOffset(0);
          // Remove hint class after animation completes
          setTimeout(() => {
            setIsHintAnimating(false);
          }, 800);
        }, 1200); // Hold peek longer
      }, 800); // Delay before peek starts

      return () => clearTimeout(peekTimeout);
    }
  }, [showSwipeHint, notification.isRead]);

  const minSwipeDistance = 50;
  const maxSwipeOffset = -125;
  const maxDeleteOffset = 125; // Positive for right swipe (delete)

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

  return (
    <div className={styles.container}>
      {/* RIGHT SIDE - Mark as Read (shows when swiping left) */}
      {swipeDirection === "left" && (
        <div className={styles.revealMask} style={{ width: Math.abs(offset) }}>
          <div className={styles.swipeActionBox}>
            <span className={styles.swipeText}>
              {t("[סמן|סמני]")}
              <br />
              כנקרא
            </span>
            <div className={styles.swipeArrow}>←</div>
          </div>
        </div>
      )}

      {/* LEFT SIDE - Delete (shows when swiping right) */}
      {swipeDirection === "right" && (
        <div className={styles.deleteRevealMask} style={{ width: Math.abs(offset) }}>
          <div className={styles.deleteActionBox}>
            <span className={styles.deleteText}>{t("[מחק|מחקי]")}</span>
            <div className={styles.deleteArrow}>→</div>
          </div>
        </div>
      )}

      {/* FOREGROUND CARD (Slides Left or Right) */}
      <div
        className={`${styles.card} ${isHintAnimating ? styles.hintAnimating : ''}`}
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
            <span className={styles.time}>
              {formatTime(notification.timestamp)}
            </span>
            <span className={styles.pipe}>|</span>
            <span className={styles.title}>{notification.title}</span>
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
