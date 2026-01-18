"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { apiUser } from "@/app/services/db_api";
import StatCard from "@/lib/components/UI/StatCard";
import Button from "@/lib/components/UI/Button";
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
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && userId) {
      setClosing(false);
      loadUser();
      loadStats();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, userId]);

  const handleCloseWithAnimation = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 400);
  };

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
      <div className={styles.overlay} onClick={handleCloseWithAnimation} />

      <div className={styles.modalContainer}>
        {/* 1. CLOSE BUTTON (Flex Item - Aligned Start/Right) */}
        <button
          className={styles.closeButton}
          onClick={handleCloseWithAnimation}
          aria-label="סגור"
        >
          <Image
            src="/icons/close.svg"
            alt="Close icon"
            width={40}
            height={40}
          />
        </button>

        <div className={styles.contentFrame}>
          {loading || closing ? (
            <div className={styles.loadingContainer}>
              <OrganicCircles
                mode="loading"
                radius={0.15}
                baseColor="#FFFFFF"
              />
            </div>
          ) : !user ? (
            <p className={styles.errorText}>משתמש לא נמצא</p>
          ) : (
            <>
              {/* 2. HEADER (Spacing via margin-top) */}
              <div className={styles.header}>
                <h1 className={styles.userName}>{user.full_name}</h1>
              </div>

              {/* 3. SCROLLABLE CONTENT */}
              <div className={styles.scrollContainer}>
                {/* Approval Section */}
                <div className={styles.approvalBox}>
                  <div className={styles.approvalContent}>
                    <div className={styles.approvalStatusText}>
                      {type === "initial" ? (
                        <>
                          ממתין לאישור ראשוני
                          {requestDate && (
                            <>
                              <br />
                              מתאריך {requestDate}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          ממתין לאישור קבוצה
                          {groupName && (
                            <>
                              <br />
                              {groupName}
                            </>
                          )}
                          {requestDate && (
                            <>
                              <br />
                              מתאריך {requestDate}
                            </>
                          )}
                        </>
                      )}
                    </div>
                    <div className={styles.actionButtons}>
                      <Button variant="reject" onClick={onReject}>
                        {t("סרב/י")}
                      </Button>
                      <Button variant="approve" onClick={onApprove}>
                        {t("אשר/י")}
                      </Button>
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
                      <span className={styles.detailLabel}>
                        הסניף הקרוב אליי
                      </span>
                      <span className={styles.detailValue}>
                        {branches.length > 0
                          ? branches
                              .map((b: string) =>
                                b === "nahalal" ? "נהלל" : "סתריה"
                              )
                              .join(", ")
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
                        <span className={styles.detailValue}>
                          {quiz.free_text}
                        </span>
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
