import React from "react";
import "./HomeFilter.css";

export interface FilterOption {
  id: string;
  label: string;
}
export const ADMIN_FILTER_OPTIONS: FilterOption[] = [
  { id: "pending", label: "ממתינים לאישור" },
  { id: "approved", label: "המפגשים הבאים" },
];

export const USER_FILTER_OPTIONS: FilterOption[] = [
  { id: "recommended", label: "חשבנו שיעניין אותך" },
  { id: "yours", label: "המפגשים שלך" },
];

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

export interface HomeFilterProps {
  options: FilterOption[];
  activeOption: string;
  onFilterChange: (optionId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HomeFilter Component
 *
 * A flexible filter component that auto-sizes based on text content.
 * It has increased height and consistent internal padding.
 */
export const HomeFilter: React.FC<HomeFilterProps> = ({
  options,
  activeOption,
  onFilterChange,
  className = "",
  style,
}) => {
  return (
    <div className={`home-filter ${className}`} style={style} role="tablist">
      {options.map((option) => (
        <button
          key={option.id}
          className={`home-filter__tab ${
            activeOption === option.id ? "home-filter__tab--active" : ""
          }`}
          onClick={() => onFilterChange(option.id)}
          type="button"
          role="tab"
          aria-selected={activeOption === option.id}
          aria-label={option.label}
        >
          <span className="home-filter__label">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default HomeFilter;
