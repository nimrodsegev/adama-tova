import React from "react";
import "./HomeFilter.css";

export type FilterSize = "small" | "medium" | "large";

export interface FilterOption {
  id: string;
  label: string;
}

export interface HomeFilterProps {
  options: FilterOption[]; // 2-3 options
  activeOption: string;
  onFilterChange: (optionId: string) => void;
  size?: FilterSize; // Control container width based on text length
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HomeFilter Component
 *
 * A flexible filter component with 2-3 buttons that auto-size based on text content.
 * Container size can be controlled with the 'size' prop.
 *
 * @example
 * // Small - for short text like "הכל/לא נקרא"
 * <HomeFilter
 *   size="small"
 *   options={[
 *     { id: 'all', label: 'הכל' },
 *     { id: 'unread', label: 'לא נקרא' }
 *   ]}
 *   activeOption="all"
 *   onFilterChange={setFilter}
 * />
 *
 * @example
 * // Medium - for medium text like "ממתינים לאישור/המפגשים הבאים"
 * <HomeFilter
 *   size="medium"
 *   options={[
 *     { id: 'pending', label: 'ממתינים לאישור' },
 *     { id: 'approved', label: 'המפגשים הבאים' }
 *   ]}
 *   activeOption="pending"
 *   onFilterChange={setFilter}
 * />
 *
 * @example
 * // Large - for long text like "חשבנו שיעניין אותך/המפגשים שלך"
 * <HomeFilter
 *   size="large"
 *   options={[
 *     { id: 'recommended', label: 'חשבנו שיעניין אותך' },
 *     { id: 'yours', label: 'המפגשים שלך' }
 *   ]}
 *   activeOption="recommended"
 *   onFilterChange={setFilter}
 * />
 */
export const HomeFilter: React.FC<HomeFilterProps> = ({
  options,
  activeOption,
  onFilterChange,
  size = "medium",
  className = "",
  style,
}) => {
  // Validate that we have 2-3 options
  if (options.length < 2 || options.length > 3) {
    console.warn("HomeFilter: Expected 2-3 options, got", options.length);
  }

  return (
    <div
      className={`home-filter home-filter--${size} ${className}`}
      style={style}
      data-button-count={options.length}
      data-size={size}
    >
      <div className="home-filter__container">
        {options.map((option) => (
          <button
            key={option.id}
            className={`home-filter__tab ${
              activeOption === option.id ? "home-filter__tab--active" : ""
            }`}
            onClick={() => onFilterChange(option.id)}
            type="button"
            aria-pressed={activeOption === option.id}
            aria-label={option.label}
          >
            <span className="home-filter__label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Preset configurations for common use cases

// Small size filters
export const ALL_UNREAD_OPTIONS: FilterOption[] = [
  { id: "all", label: "הכל" },
  { id: "unread", label: "לא נקרא" },
];

// Medium size filters
export const ADMIN_FILTER_OPTIONS: FilterOption[] = [
  { id: "pending", label: "ממתינים לאישור" },
  { id: "approved", label: "המפגשים הבאים" },
];

// Large size filters
export const USER_FILTER_OPTIONS: FilterOption[] = [
  { id: "recommended", label: "חשבנו שיעניין אותך" },
  { id: "yours", label: "המפגשים שלך" },
];

// Medium size - 3 buttons
export const ADMIN_STATUS_OPTIONS: FilterOption[] = [
  { id: "all", label: "הכל" },
  { id: "approved", label: "מאושרים" },
  { id: "pending", label: "ממתינים לאישור" },
];

// Medium size - 3 buttons
export const AVAILABILITY_OPTIONS: FilterOption[] = [
  { id: "all", label: "הכל" },
  { id: "waitlist", label: "רשימת המתנה" },
  { id: "available", label: "מקום פנוי" },
];

export default HomeFilter;
