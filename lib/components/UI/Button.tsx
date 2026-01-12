"use client";

import React from "react";
import Link from "next/link";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "approve"
    | "reject"
    | "popup-primary"
    | "popup-secondary"
    | "whatsapp"
    | "waiting-list";
  size?: "S" | "M" | "L";
  colorType?: "orange" | "delete" | "white";
  children: React.ReactNode;
  href?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "M",
  colorType = "orange",
  children,
  className,
  href,
  ...props
}) => {
  const isTertiary = variant === "tertiary";
  const isFixedSize = [
    "approve",
    "reject",
    "popup-primary",
    "popup-secondary",
    "whatsapp",
    "waiting-list",
  ].includes(variant);

  const buttonClasses = [
    styles.base,
    styles[variant],
    !isTertiary && !isFixedSize ? styles[`size${size}`] : null,
    isTertiary ? styles[colorType] : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderIcon = () => {
    if (variant === "whatsapp") return <div className={styles.whatsappIcon} />;
    if (variant === "waiting-list") {
      return (
        <div className={styles.clockIcon}>
          <div className={styles.clockInner} />
          <div className={styles.clockHandLong} />
          <div className={styles.clockHandShort} />
        </div>
      );
    }
    if (isTertiary) {
      return (
        <div className={styles.arrowWrapper}>
          <span className={styles.chevron}>›</span>
        </div>
      );
    }
    return null;
  };

  const content = (
    <>
      <span className={styles.label}>{children}</span>
      {renderIcon()}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={buttonClasses}
        style={{ textDecoration: "none" }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button className={buttonClasses} {...props}>
      {content}
    </button>
  );
};

export default Button;
