"use client";

import React from "react";
import styles from "./UserApprovalCard.module.css";
import Button from "./Button";

interface UserApprovalCardProps {
  userName: string;
  requestDate: string;
  onApprove?: () => void;
  onReject?: () => void;
}

const UserApprovalCard: React.FC<UserApprovalCardProps> = ({
  userName,
  requestDate,
  onApprove,
  onReject,
}) => {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.contentWrapper}>
        {/* RIGHT SIDE: Text and Info */}
        <div className={styles.infoSection}>
          {/* Line 1: User Name & Icon */}
          <div className={styles.userHeader}>
            <span className={styles.userName}>{userName}</span>
            <div className={styles.userIcon}>
              <div className={styles.iconCircle} />
              <div className={styles.iconBody} />
            </div>
          </div>

          <div className={styles.statusWrapper}>
            {/* Line 2: Status */}
            <p className={styles.statusLine}>ממתין לאישור ראשוני</p>

            {/* Line 3: Date */}
            <p className={styles.statusLine}>מתאריך {requestDate}</p>

            {/* Line 4: Circle Placeholder */}
            <p className={styles.circleLine}>מעגל</p>
          </div>
        </div>

        {/* LEFT SIDE: Action Buttons */}
        <div className={styles.actionSection}>
          <div className={styles.buttonStack}>
            <Button variant="approve" onClick={onApprove}>
              אשר
            </Button>
            <Button variant="reject" onClick={onReject}>
              סרב
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserApprovalCard;
