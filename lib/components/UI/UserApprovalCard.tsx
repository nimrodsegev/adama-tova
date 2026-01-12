"use client";

import React from "react";
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
    <div className={styles.cardContainer} onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <div className={styles.contentWrapper}>
        {/* RIGHT SIDE: Text and Info */}
        <div className={styles.infoSection}>
          {/* Line 1: Icon & User Name */}
          <div className={styles.userHeader}>
            <div className={styles.userIcon}>
              <div className={styles.iconCircle} />
              <div className={styles.iconBody} />
            </div>
            <span className={styles.userName}>{userName}</span>
          </div>

          {/* Status lines */}
          <div className={styles.statusWrapper}>
            <p className={styles.statusLine}>
              {type === "initial" ? "ממתין לאישור ראשוני" : "ממתין לאישור קבוצה"}
            </p>
            <p className={styles.statusLine}>מתאריך {requestDate}</p>
            <p className={styles.circleLine}>{circle || "לא מצויין מעגל"}</p>
          </div>
        </div>

        {/* LEFT SIDE: Action Buttons */}
        <div className={styles.buttonStack} onClick={(e) => e.stopPropagation()}>
          <Button variant="approve" onClick={onApprove}>
            {t("אשר/י")}
          </Button>
          <Button variant="reject" onClick={onReject}>
            {t("סרב/י")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserApprovalCard;
