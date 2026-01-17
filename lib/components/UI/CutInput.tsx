"use client";

import React, { useRef, useState, useEffect } from "react";
import styles from "./CutInput.module.css";

interface CutInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  onErrorExpire?: () => void;
  dir?: "rtl" | "ltr";
  textAlign?: "right" | "left";
  placeholderAlign?: "right" | "left" | "center";
  className?: string;
  tall?: boolean;
}

export default function CutInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  onErrorExpire,
  dir = "rtl",
  textAlign = "right",
  placeholderAlign,
  className,
  tall = false,
}: CutInputProps) {
  const [showError, setShowError] = useState(false);
  const labelRef = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [gapStart, setGapStart] = useState(231);
  const [gapEnd, setGapEnd] = useState(285.5);

  // Auto-hide error after 6 seconds and return to original label
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        onErrorExpire?.();
      }, 6000);
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
  }, [error, onErrorExpire]);

  const displayLabel = (showError && error) ? error : label;
  const isError = showError && !!error;

  // Measure label and calculate gap positions
  useEffect(() => {
    if (labelRef.current && wrapperRef.current) {
      const labelWidth = labelRef.current.offsetWidth;
      const wrapperWidth = wrapperRef.current.offsetWidth;

      // Convert pixel measurements to SVG viewBox coordinates (315 units wide)
      const scale = 315 / wrapperWidth;

      // Label is positioned at right: 2rem from wrapper edge
      // Gap should be centered around the label with some padding
      const labelRightOffset = 32; // ~2rem in pixels
      const padding = 4; // Extra padding on each side of label

      const gapEndPos = 315 - (labelRightOffset * scale) + (padding * scale);
      const gapStartPos = gapEndPos - (labelWidth * scale) - (padding * 2 * scale);

      setGapEnd(Math.min(gapEndPos, 306)); // Don't go past the corner curve
      setGapStart(Math.max(gapStartPos, 10)); // Don't go past the left corner
    }
  }, [displayLabel]);

  // Build the SVG path with dynamic gap - different paths for normal vs tall
  const svgPath = tall
    ? `M${gapEnd} 0.5H306C308.5 0.5 314 2 314.5 8.5C314.5 15.3 314.5 92 314.5 103.5C314.5 106.5 312.8 112.1 306 112.5C299.2 112.9 105.5 112.7 9.5 112.5C7 112.5 1 111.5 0.5 105C0.5 98.2 0.5 20.1667 0.5 8.5C0.5 6 2 1 8 0.5C14.8 0.5 172.333 0.5 ${gapStart} 0.5`
    : `M${gapEnd} 0.5H306C308.5 0.5 314 2 314.5 8.5C314.5 15.3 314.5 39.3333 314.5 50.5C314.5 53.3333 312.8 59.1 306 59.5C299.2 59.9 105.5 59.6667 9.5 59.5C7 59.5 1 58.5 0.5 52C0.5 45.2 0.5 20.1667 0.5 8.5C0.5 6 2 1 8 0.5C14.8 0.5 172.333 0.5 ${gapStart} 0.5`;

  const wrapperClass = tall
    ? `${styles.wrapper} ${styles.wrapperTall} ${className || ""}`
    : `${styles.wrapper} ${className || ""}`;

  return (
    <div ref={wrapperRef} className={wrapperClass}>
      {/* SVG Border with dynamic gap for label */}
      <svg
        className={styles.border}
        viewBox={tall ? "0 0 315 114" : "0 0 315 61"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d={svgPath}
          className={`${styles.borderPath} ${isError ? styles.borderError : ""}`}
          strokeLinecap="round"
        />
      </svg>

      {/* Label positioned in the gap */}
      <span
        ref={labelRef}
        className={`${styles.label} ${isError ? styles.labelError : ""}`}
      >
        {displayLabel}
      </span>

      {/* Actual input field - use textarea for tall variant */}
      {tall ? (
        <textarea
          value={value}
          onChange={onChange as unknown as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
          placeholder={placeholder}
          className={`${styles.input} ${styles.inputTall}${placeholderAlign === 'center' ? ` ${styles.placeholderCenter}` : ''}${placeholderAlign === 'left' ? ` ${styles.placeholderLeft}` : ''}${placeholderAlign === 'right' ? ` ${styles.placeholderRight}` : ''}`}
          dir={dir}
          style={{ textAlign }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${styles.input}${placeholderAlign === 'center' ? ` ${styles.placeholderCenter}` : ''}${placeholderAlign === 'left' ? ` ${styles.placeholderLeft}` : ''}${placeholderAlign === 'right' ? ` ${styles.placeholderRight}` : ''}`}
          dir={dir}
          style={{ textAlign }}
        />
      )}
    </div>
  );
}
