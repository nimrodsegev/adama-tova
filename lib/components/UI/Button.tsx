import React from "react";
import Link from "next/link";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "S" | "M" | "L"; // Sizes for Primary/Secondary
  colorType?: "orange" | "delete" | "white"; // Specific types for Tertiary
  children: React.ReactNode;
  href?: string; // New prop for navigation
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
  // Tertiary variants include a specific arrow icon (Rectangle 2159)
  const isTertiary = variant === "tertiary";

  const buttonClasses = [
    styles.base,
    styles[variant],
    !isTertiary ? styles[`size${size}`] : styles[colorType],
    className,
  ].join(" ");

  // Content shared between Button and Link
  const content = (
    <>
      {isTertiary && (
        <div className={styles.iconWrapper}>
          <div className={styles.arrowIcon} />
        </div>
      )}
      <span className={styles.label}>{children}</span>
    </>
  );

  // If href is provided, render as Next.js Link
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

  // Otherwise render as standard button
  return (
    <button className={buttonClasses} {...props}>
      {content}
    </button>
  );
};

export default Button;
