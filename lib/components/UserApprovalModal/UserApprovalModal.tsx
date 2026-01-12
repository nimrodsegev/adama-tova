"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { apiUser } from "@/app/services/db_api";
import Button from "@/lib/components/UI/Button";
import { useIvrita } from "@/app/contexts/IvritaContext";
import styles from "./UserApprovalModal.module.css";

type UserApprovalModalProps = {
  userId: string;
  type: "initial" | "group";
  groupName?: string;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
};

export default function UserApprovalModal({
  userId,
  type,
  groupName,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: UserApprovalModalProps) {
  const { t } = useIvrita();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && userId) {
      loadUser();
    }
  }, [isOpen, userId]);

  const loadUser = async () => {
    setLoading(true);
    const [data, error] = await apiUser.getProfile(userId);
    if (data) setUser(data);
    setLoading(false);
  };

  if (!isOpen || !mounted) return null;

  const quiz = user?.quiz || {};

  const modalContent = (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modalContainer}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="#681F02"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className={styles.contentFrame}>
          {loading ? (
            <p className={styles.loadingText}>טוען...</p>
          ) : !user ? (
            <p className={styles.loadingText}>משתמש לא נמצא</p>
          ) : (
            <>
              {/* Title */}
              <h1 className={styles.titleText}>{user.full_name}</h1>

              {/* Status */}
              <div className={styles.statusBadge}>
                {type === "initial" ? "ממתין לאישור ראשוני" : "ממתין לאישור קבוצה"}
              </div>

              {/* Group Name (for group approval) */}
              {type === "group" && groupName && (
                <div className={styles.infoSection}>
                  <h3 className={styles.sectionTitle}>קבוצה</h3>
                  <p className={styles.sectionText}>{groupName}</p>
                </div>
              )}

              {/* Circle */}
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>מעגל</h3>
                <p className={styles.sectionText}>{quiz.circle || "לא צוין"}</p>
              </div>

              {/* Interests */}
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>תחומי עניין</h3>
                {quiz.interests?.length > 0 ? (
                  <div className={styles.tagsContainer}>
                    {quiz.interests.map((interest: string, i: number) => (
                      <span key={i} className={styles.tag}>
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={styles.sectionText}>לא צוינו תחומי עניין</p>
                )}
              </div>

              {/* Free Text */}
              {quiz.free_text && (
                <div className={styles.infoSection}>
                  <h3 className={styles.sectionTitle}>הערות</h3>
                  <p className={styles.sectionText}>{quiz.free_text}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>פרטי קשר</h3>
                <p className={styles.sectionText}>{user.email}</p>
                {user.phone && <p className={styles.sectionText}>{user.phone}</p>}
              </div>

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <Button variant="approve" onClick={onApprove}>
                  {t("אשר/י")}
                </Button>
                <Button variant="reject" onClick={onReject}>
                  {t("סרב/י")}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
