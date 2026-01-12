import React from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "S" | "M" | "L"; // Sizes for Primary/Secondary
  colorType?: "orange" | "delete" | "white"; // Specific types for Tertiary
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "M",
  colorType = "orange",
  children,
  className,
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

  return (
    <button className={buttonClasses} {...props}>
      {isTertiary && (
        <div className={styles.iconWrapper}>
          <div className={styles.arrowIcon} />
        </div>
      )}
      <span className={styles.label}>{children}</span>
    </button>
  );
};

export default Button;
