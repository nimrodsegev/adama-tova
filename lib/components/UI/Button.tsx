"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
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
    | "login";
  size?: "L" | "L-short";
  // ⭐ NEW: Tertiary-specific props
  tertiarySize?: "small" | "base" | "medium" | "large" | "xlarge";
  tertiaryWeight?: "light" | "normal" | "semibold" | "bold";
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
  tertiarySize = "large",
  tertiaryWeight = "normal",
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
  const isSpecialVariant = ["whatsapp", "waiting-list", "login"].includes(
    variant
  );

  const dynamicStyles: React.CSSProperties = {
    ...style,
    ...(customBgColor && { backgroundColor: customBgColor }),
    ...(customTextColor && { color: customTextColor }),
    ...(customBorderColor && { border: `1px solid ${customBorderColor}` }),
  };

  // ⭐ Build button classes with tertiary size/weight support
  const buttonClasses = [
    styles.base,
    styles[variant],
    !isTertiary && !isSpecialVariant
      ? styles[`size${size.replace("-", "")}`]
      : null,
    isTertiary ? styles[colorType] : null,
    // ⭐ Add tertiary size class
    isTertiary && tertiarySize
      ? styles[
          `tertiary${
            tertiarySize.charAt(0).toUpperCase() + tertiarySize.slice(1)
          }`
        ]
      : null,
    // ⭐ Add tertiary weight class
    isTertiary && tertiaryWeight
      ? styles[
          `tertiary${
            tertiaryWeight.charAt(0).toUpperCase() + tertiaryWeight.slice(1)
          }`
        ]
      : null,
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
      // ⭐ Use SVG icon with color matching
      return (
        <div className={styles.arrowWrapper}>
          <svg
            width="8"
            height="14"
            viewBox="0 0 8 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.arrowIcon}
          >
            <path
              d="M7 1L1 7L7 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
