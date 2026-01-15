"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { apiUser } from "@/app/services/db_api";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import styles from "./UserProfileModal.module.css";

type UserProfileModalProps = {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function UserProfileModal({
  userId,
  isOpen,
  onClose,
}: UserProfileModalProps) {
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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, userId]);

  const loadUser = async () => {
    setLoading(true);
    const [data, error] = await apiUser.getProfile(userId);
    if (data) setUser(data);
    setLoading(false);
  };

  if (!isOpen || !mounted) return null;

  const quiz = user?.quiz || {};
  const branches = user?.branches || [];

  const modalContent = (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modalContainer}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
            <line x1="2" y1="2" x2="18" y2="18" stroke="#F9F9F9" strokeWidth="1" />
            <line x1="18" y1="2" x2="2" y2="18" stroke="#F9F9F9" strokeWidth="1" />
          </svg>
        </button>

        <div className={styles.contentFrame}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <OrganicCircles mode="loading" radius={0.15} baseColor="#FFFFFF" />
            </div>
          ) : !user ? (
            <p className={styles.errorText}>משתמש לא נמצא</p>
          ) : (
            <>
              {/* Header with User Name */}
              <div className={styles.header}>
                <h1 className={styles.userName}>{user.full_name}</h1>
              </div>

              {/* Scrollable Content */}
              <div className={styles.scrollContainer}>
                {/* Personal Details Box */}
                <div className={styles.profileBox}>
                  <div className={styles.boxHeader}>
                    <span className={styles.boxTitle}>פרטים אישיים</span>
                  </div>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>טלפון</span>
                      <span className={styles.detailValue} dir="ltr">
                        {user.phone || "לא צוין"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>אימייל</span>
                      <span className={styles.detailValue}>{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Details Box */}
                <div className={styles.profileBox}>
                  <div className={styles.boxHeader}>
                    <span className={styles.boxTitle}>פרטים נוספים</span>
                  </div>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>הסניף הקרוב אליי</span>
                      <span className={styles.detailValue}>
                        {branches.length > 0
                          ? branches.map((b: string) => b === "nahalal" ? "נהלל" : "סתריה").join(", ")
                          : "לא צוין"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>המעגל שלי</span>
                      <span className={styles.detailValue}>
                        {quiz.circle || "לא צוין"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>תחומי עניין</span>
                      <span className={styles.detailValue}>
                        {quiz.interests?.length > 0
                          ? quiz.interests.join(", ")
                          : "לא נבחרו"}
                      </span>
                    </div>
                    {quiz.free_text && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>הערות</span>
                        <span className={styles.detailValue}>{quiz.free_text}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
