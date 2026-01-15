"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { apiUser } from "@/app/services/db_api";
import StatCard from "@/lib/components/UI/StatCard";
import { useIvrita } from "@/app/contexts/IvritaContext";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import styles from "./UserApprovalModal.module.css";

type UserApprovalModalProps = {
  userId: string;
  type: "initial" | "group";
  groupName?: string;
  requestDate?: string;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
};

export default function UserApprovalModal({
  userId,
  type,
  groupName,
  requestDate,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: UserApprovalModalProps) {
  const { t } = useIvrita();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ groups: 0, workshops: 0 });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && userId) {
      loadUser();
      loadStats();
    }
  }, [isOpen, userId]);

  const loadUser = async () => {
    setLoading(true);
    const [data, error] = await apiUser.getProfile(userId);
    if (data) setUser(data);
    setLoading(false);
  };

  const loadStats = async () => {
    const [data, error] = await apiUser.getUserActivityStats(userId);
    if (data) setStats(data);
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="#F9F9F9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
                {/* Approval Section - White bordered box */}
                <div className={styles.approvalBox}>
                  <div className={styles.approvalContent}>
                    {/* Status text on the right */}
                    <div className={styles.approvalStatusText}>
                      {type === "initial" ? (
                        <>ממתין לאישור ראשוני{requestDate && <><br />מתאריך {requestDate}</>}</>
                      ) : (
                        <>
                          ממתין לאישור קבוצה
                          {groupName && <><br />{groupName}</>}
                          {requestDate && <><br />מתאריך {requestDate}</>}
                        </>
                      )}
                    </div>
                    {/* Buttons on the left */}
                    <div className={styles.actionButtons}>
                      <button className={styles.rejectButton} onClick={onReject}>
                        {t("סרב/י")}
                      </button>
                      <button className={styles.approveButton} onClick={onApprove}>
                        {t("אשר/י")}
                      </button>
                    </div>
                  </div>
                </div>

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

                {/* Stats Cards */}
                <div className={styles.statsContainer}>
                  <StatCard
                    label="סה״כ קבוצות:"
                    value={stats.groups}
                    emptyMessage="משתמש זה לא רשום לקבוצות"
                  />
                  <StatCard
                    label="סה״כ סדנאות:"
                    value={stats.workshops}
                    emptyMessage="משתמש זה לא רשום לסדנאות"
                  />
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
