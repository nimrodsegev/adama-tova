"use client";
import React from "react";
import Image from "next/image";
import styles from "./UserApprovalCard.module.css";
import Button from "./Button";
import { useIvrita } from "@/app/contexts/IvritaContext";

interface UserApprovalCardProps {
  userName: string;
  requestDate: string;
  circle?: string;
  groupName?: string;
  type?: "initial" | "group";
  onApprove?: () => void;
  onReject?: () => void;
  onClick?: () => void;
}

const UserApprovalCard: React.FC<UserApprovalCardProps> = ({
  userName,
  requestDate,
  circle,
  groupName,
  type = "initial",
  onApprove,
  onReject,
  onClick,
}) => {
  const { t } = useIvrita();

  return (
    <div
      className={styles.cardContainer}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {/* ⭐ User name takes full width at the top */}
      <div className={styles.userHeader}>
        {/* ⭐ NEW: Using SVG icon */}
        <div className={styles.userIcon}>
          <Image
            src="/icons/figure_active.svg"
            alt=""
            width={13}
            height={15}
            className={styles.userIconImage}
          />
        </div>
        <span className={styles.userName}>{userName}</span>
      </div>

      {/* Content wrapper - status and buttons */}
      <div className={styles.contentWrapper}>
        {/* Status lines */}
        <div className={styles.statusWrapper}>
          <p className={styles.statusLine}>
            {type === "initial" ? "ממתין לאישור ראשוני" : "ממתין לאישור קבוצה"}
          </p>
          <p className={styles.statusLine}>מתאריך {requestDate}</p>
        </div>

        {/* Action Buttons */}
        <div
          className={styles.buttonStack}
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="reject" onClick={onReject}>
            {t("סרב/י")}
          </Button>
          <Button variant="approve" onClick={onApprove}>
            {t("אשר/י")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserApprovalCard;
