import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Card Container - Entire card is clickable
  cardContainer: {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1rem", // 12px 16px
    gap: "0.75rem", // 12px gap between elements
    width: "100%",
    maxWidth: "22.0625rem", // 353px
    height: "4.4375rem", // 71px
    background: "rgba(255, 255, 255, 0.7)",
    borderRadius: "1.25rem", // 20px
    position: "relative",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    direction: "rtl",
  },

  // Register Button - RIGHT MOST SIDE
  registerButton: {
    position: "relative",
    zIndex: 10,
    flex: "none",
    order: 0,
  },

  // Content Area - MIDDLE (3 lines)
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0",
    flex: 1,
    order: 1,
  },

  // Line 1: Title (Bold)
  title: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "700",
    fontSize: "1.25rem", // 20px
    lineHeight: "1.25rem", // 20px
    textAlign: "right",
    color: "#681F02",
    margin: 0,
    width: "100%",
  },

  // Line 2: Time (start - end)
  time: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "300",
    fontSize: "1rem", // 16px
    lineHeight: "1.0625rem", // 17px
    textAlign: "right",
    color: "#681F02",
    margin: 0,
    width: "100%",
  },

  // Line 3: Participants Ratio (normal state)
  participants: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "300",
    fontSize: "1rem", // 16px
    lineHeight: "1.0625rem", // 17px
    textAlign: "right",
    color: "#681F02",
    margin: 0,
    width: "100%",
  },

  // Line 3: Participants Ratio (FULL - RED)
  participantsFull: {
    color: "#FF0000",
    fontWeight: "400",
  },

  // Arrow - LEFT MOST SIDE
  arrow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    flex: "none",
    order: 2,
  },

  // Registration Indicator Dot
  registrationDot: {
    boxSizing: "border-box",
    position: "absolute",
    right: "3.5rem",
    top: "0.875rem",
    width: "0.46875rem",
    height: "0.46875rem",
    background: "#E6C3BB",
    border: "0.0625rem solid #681F02",
    borderRadius: "50%",
  },
};

export default styles;
