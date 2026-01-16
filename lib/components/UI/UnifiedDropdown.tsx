import React from 'react';
import styles from './UnifiedDropdown.module.css';

interface DropdownOption {
  label: string;
  value: string;
}

interface UnifiedDropdownProps {
  label: string;
  placeholder?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  isMini?: boolean;
}

export default function UnifiedDropdown({
  label,
  placeholder = "בחר/י",
  options,
  value,
  onChange,
  isOpen,
  onToggle,
  className = '',
  isMini = false,
}: UnifiedDropdownProps) {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div 
      className={`
        ${styles.dropdownContainer} 
        ${isOpen ? styles.active : ''} 
        ${isMini ? styles.miniDropdown : ''} 
        ${className}
      `}
    >
      {/* FIELDSET BORDER STRATEGY (Standard Only) 
          This creates the border gap naturally using HTML flow.
      */}
      {!isMini && (
        <fieldset 
          aria-hidden="true" 
          className={styles.borderFieldset}
        >
          <legend className={styles.borderLegend}>
            {/* Span adds breathing room for the cut */}
            <span>{label}</span>
          </legend>
        </fieldset>
      )}

      {/* VISIBLE LABEL (Positioned over the gap) */}
      {!isMini && (
        <span className={styles.dropdownLabel}>
          {label}
        </span>
      )}

      {/* TOGGLE BUTTON */}
      <button
        type="button"
        onClick={onToggle}
        className={styles.dropdownToggle}
      >
        <span className={!value ? styles.placeholder : styles.selectedValue}>
          {selectedOption?.label || placeholder}
        </span>
        
        {/* CSS-Only Arrow (Matching SignupWizard) */}
        <div className={`${styles.arrowIcon} ${isOpen ? styles.rotated : ''}`}>
          <svg width="18" height="8" viewBox="0 0 18 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0.500067 0.5L8.53964 6.53906L16.5792 0.5" 
              stroke="#F9F9F9" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                onToggle();
              }}
              className={`${styles.dropdownOption} ${
                value === option.value ? styles.selected : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}