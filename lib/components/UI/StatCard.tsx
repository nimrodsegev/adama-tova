"use client";

import styles from "./StatCard.module.css";

type StatCardProps = {
  label: string;
  value: number | string;
  emptyMessage?: string;
  className?: string;
};

export default function StatCard({ label, value, emptyMessage, className }: StatCardProps) {
  const isEmpty = value === 0 || value === "0";

  return (
    <div className={`${styles.statCard} ${isEmpty ? styles.empty : styles.filled} ${className || ""}`}>
      {isEmpty && emptyMessage ? (
        <span className={styles.emptyMessage}>{emptyMessage}</span>
      ) : (
        <div className={styles.contentWrapper}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
        </div>
      )}
    </div>
  );
}
