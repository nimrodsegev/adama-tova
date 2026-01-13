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
    | "waiting-list"
    | "custom"
    | "login"; // <--- Added "login"

  size?: "L" | "L-short";
  icon?: React.ReactNode;

  customBgColor?: string;
  customTextColor?: string;
  customBorderColor?: string;

  colorType?: "orange" | "delete" | "white";
  children: React.ReactNode;
  href?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "L",
  colorType = "orange",
  icon,
  customBgColor,
  customTextColor,
  customBorderColor,
  children,
  className,
  href,
  style,
  ...props
}) => {
  const isTertiary = variant === "tertiary";

  // Login is now a "special" variant that ignores standard sizing
  const isSpecialVariant = [
    "whatsapp",
    "waiting-list",
    "login", // <--- Added here to prevent "sizeL" class from conflicting
  ].includes(variant);

  const dynamicStyles: React.CSSProperties = {
    ...style,
    ...(customBgColor && { backgroundColor: customBgColor }),
    ...(customTextColor && { color: customTextColor }),
    ...(customBorderColor && { border: `1px solid ${customBorderColor}` }),
  };

  const buttonClasses = [
    styles.base,
    styles[variant],
    !isTertiary && !isSpecialVariant
      ? styles[`size${size.replace("-", "")}`]
      : null,
    isTertiary ? styles[colorType] : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderVariantIcon = () => {
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
      {icon && <span className={styles.startIcon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
      {renderVariantIcon()}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={buttonClasses}
        style={{ textDecoration: "none", ...dynamicStyles }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={buttonClasses}
      style={dynamicStyles}
      type="button"
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
