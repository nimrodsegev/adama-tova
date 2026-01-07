import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Main container - Fixed height, no scroll
  mainContainer: {
    width: "100%",
    maxWidth: "50rem", // 800px
    height: "90vh",
    margin: "0 auto",
    direction: "rtl",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden", // Prevent main container scroll
  },

  // Header - Fixed at top
  header: {
    padding: "1.25rem", // 20px
    backgroundColor: "transparent",
    border: "none",
    flexShrink: 0, // Don't shrink
  },

  title: {
    fontSize: "1.5rem", // 32px
    marginBottom: "0.5rem", // 8px
    textAlign: "right",
    margin: 0,
  },

  subtitle: {
    fontSize: "1rem", // 16px
    color: "#666",
    textAlign: "right",
    margin: 0,
    marginTop: "0.5rem",
  },

  // Scrollable container - Stops before navbar
  scrollableContainer: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "0 1.25rem 7rem 1.25rem", // 20px sides, 112px bottom (for navbar)
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(0,0,0,0.3) transparent",
  },

  // Form
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem", // 20px
  },

  // Field container
  fieldContainer: {
    display: "flex",
    flexDirection: "column",
  },

  // Label
  label: {
    display: "block",
    marginBottom: "0.5rem", // 8px
    fontWeight: "bold",
    textAlign: "right",
  },

  // Input
  input: {
    width: "100%",
    padding: "0.75rem", // 12px
    borderRadius: "0.5rem", // 8px
    border: "2px solid #ccc",
    fontSize: "1rem", // 16px
    textAlign: "right",
    direction: "rtl",
    boxSizing: "border-box",
  },

  // File input
  fileInput: {
    width: "100%",
    padding: "0.75rem", // 12px
    borderRadius: "0.5rem", // 8px
    border: "2px solid #ccc",
    backgroundColor: "white",
    textAlign: "right",
    direction: "rtl",
    boxSizing: "border-box",
  },

  // File name display
  fileNameDisplay: {
    marginTop: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    color: "#666",
    textAlign: "right",
  },

  // Time row
  timeRow: {
    display: "flex",
    gap: "1rem", // 16px
  },

  // Time field
  timeField: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  // Select
  select: {
    width: "100%",
    padding: "0.75rem", // 12px
    borderRadius: "0.5rem", // 8px
    border: "2px solid #ccc",
    fontSize: "1rem", // 16px
    textAlign: "right",
    direction: "rtl",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  // Textarea
  textarea: {
    width: "100%",
    padding: "0.75rem", // 12px
    borderRadius: "0.5rem", // 8px
    border: "2px solid #ccc",
    fontSize: "1rem", // 16px
    textAlign: "right",
    direction: "rtl",
    resize: "vertical",
    boxSizing: "border-box",
  },

  // Submit button
  submitButton: {
    padding: "1rem", // 16px
    border: "none",
    borderRadius: "0.5rem", // 8px
    fontSize: "1.125rem", // 18px
    fontWeight: "bold",
    color: "#fff",
    transition: "background-color 0.3s",
  },

  // Error message
  errorMessage: {
    padding: "1rem", // 16px
    backgroundColor: "#ffebee",
    border: "2px solid #f44336",
    borderRadius: "0.5rem", // 8px
    textAlign: "center",
    color: "#c62828",
    fontWeight: "bold",
  },

  // Success message
  successMessage: {
    padding: "1rem", // 16px
    backgroundColor: "#e8f5e9",
    border: "2px solid #4caf50",
    borderRadius: "0.5rem", // 8px
    textAlign: "center",
    color: "#2e7d32",
    fontWeight: "bold",
  },
};

export default styles;
