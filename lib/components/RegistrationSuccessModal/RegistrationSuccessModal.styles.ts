import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Overlay backdrop
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "transparent",
    zIndex: 1999,
    animation: "fadeIn 0.2s ease-in-out",
  },

  // Modal container - FULL SCREEN FROM TOP TO NAVBAR
  modalContainer: {
    position: "fixed",
    top: 0,
    bottom: "6.8125rem", // 61px for navbar
    left: 0,
    right: 0,
    width: "100%",
    maxWidth: "100vw",
    backgroundColor: "#F28130", // Orange background
    zIndex: 2000,
    overflowY: "auto",
    overflowX: "hidden",
    animation: "slideUp 0.3s ease-out",
    direction: "rtl",
    margin: "0 auto",
  },

  // Close button (top right)
  closeButton: {
    position: "absolute",
    width: "2.75rem", // 44px
    height: "2.75rem", // 44px
    right: "1.25rem", // 20px
    top: "1.25rem", // 20px
    border: "1px solid #F9F9F9",
    borderRadius: "1.5625rem", // 25px
    background: "transparent",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    zIndex: 10,
    padding: "0.3125rem", // 5px
    transition: "transform 0.2s ease",
  },

  // Content Frame - centered vertically and horizontally
  contentFrame: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 1.5rem",
    gap: "1rem", // ✅ CHANGED: 16px gap (closer to icon)
    position: "absolute",
    width: "100%",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },

  // Icon container
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "5.53625rem", // 88.58px
    height: "4.7125rem", // 75.4px
  },

  // Success icon (IMG tag)
  successIcon: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  // Message text - centered symmetrically with TWO LINES
  messageText: {
    width: "100%",
    maxWidth: "18rem", // Limit width for better readability
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "300",
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // ✅ CHANGED: 24px line height for better spacing between lines
    textAlign: "center",
    color: "#FFFFFF",
    margin: 0,
  },
};

export default styles;
