import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Card Container
  cardContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    padding: "0.25rem 0.5rem 1rem 1rem",
    width: "100%",
    maxWidth: "10.4375rem",
    minWidth: "9rem",
    height: "9.625rem",
    background: "none",
    textDecoration: "none",
    color: "#681F02",
    direction: "rtl",
    position: "relative",
    cursor: "pointer",
    flex: "none",
    transition: "transform 0.2s ease",
  },

  // Frame 224 - Contains title and date/time with ABSOLUTE positioning
  frame224: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    padding: "0",
    gap: "0", // ✅ REMOVED gap - we'll use absolute positioning instead
    width: "100%",
    maxWidth: "8.4375rem",
    position: "relative", // ✅ CHANGED: relative positioning for absolute children
    flex: "none",
    order: 0,
    alignSelf: "stretch",
    flexGrow: 0,
    zIndex: 0,
    marginTop: "1rem", // Starting position from top
    height: "6rem", // ✅ ADDED: Fixed height to contain both elements
  },

  // Title text - FIXED ALLOCATED SPACE
  titleText: {
    position: "absolute", // ✅ CHANGED: Absolute positioning
    top: "0", // ✅ Title always starts at top of frame224
    right: "0", // ✅ Align to right
    width: "100%",
    maxWidth: "4.5rem", // Width limit
    height: "2.75rem", // ✅ ADDED: Fixed allocated space for title (2 lines)
    minHeight: "2.75rem", // ✅ ADDED: Ensures space is always reserved
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "clamp(1.125rem, 4.5vw, 1.375rem)",
    lineHeight: "1.375rem",
    display: "block", // ✅ CHANGED: from flex to block
    textAlign: "right",
    color: "#681F02",
    marginTop: "0",
    marginLeft: "2rem",
    overflow: "hidden", // ✅ Hide text that exceeds allocated space
    whiteSpace: "normal", // ✅ Allows wrapping
    wordBreak: "keep-all", // ✅ Never break words
    overflowWrap: "normal", // ✅ Only break at natural word boundaries
  },

  // Frame 266 - Contains date and time - FIXED POSITION
  frame266: {
    position: "absolute", // ✅ CHANGED: Absolute positioning
    top: "3.25rem", // ✅ FIXED: Always 3.25rem from top (below title space)
    right: "0", // ✅ Align to right
    width: "100%",
    maxWidth: "8.4375rem",
    flex: "none",
  },

  // Body M - Date and time text
  bodyM: {
    width: "100%",
    maxWidth: "8.4375rem",
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "light",
    fontWeight: "300",
    fontSize: "clamp(0.9375rem, 3.8vw, 1.0625rem)",
    lineHeight: "1.125rem",
    textAlign: "right",
    color: "#681F02",
    margin: "0",
  },

  // Register button - Top left corner
  registerButton: {
    position: "absolute",
    left: "0.5rem",
    top: "1.5rem",
    zIndex: 10,
  },

  // Arrow button - Bottom left
  arrowButton: {
    position: "absolute",
    left: "-0.1rem",
    bottom: "1.25rem",
    width: "2rem",
    height: "2rem",
    minWidth: "1.75rem",
    minHeight: "1.75rem",
    borderRadius: "50%",
    background: "transparent",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "none",
    pointerEvents: "none",
    transition: "transform 0.2s ease",
  },

  arrowIcon: {
    color: "#FFFFFF",
    fontSize: "2.5rem",
    lineHeight: "1",
  },
};

export default styles;
