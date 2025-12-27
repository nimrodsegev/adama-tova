import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
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

  frame224: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    padding: "0",
    gap: "0.375rem",
    width: "100%",
    maxWidth: "8.4375rem",
    flex: "none",
    order: 0,
    alignSelf: "stretch",
    flexGrow: 0,
    zIndex: 0,
  },

  titleText: {
    width: "100%",
    maxWidth: "8.4375rem",
    height: "auto",
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif", // ✅ Updated
    fontStyle: "normal",
    fontWeight: "400", // ✅ Regular 400
    fontSize: "clamp(1.125rem, 4.5vw, 1.375rem)", // ✅ CHANGED: from clamp(1rem, 4vw, 1.25rem) - larger font
    lineHeight: "1.375rem",
    display: "flex",
    alignItems: "flex-end",
    textAlign: "right",
    color: "#681F02",
    marginTop: "-0.25rem",
    flex: "none",
    order: 0,
    flexGrow: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  frame266: {
    width: "100%",
    maxWidth: "8.4375rem",
    flex: "none",
    order: 1,
    flexGrow: 0,
    position: "relative",
  },

  bodyM: {
    width: "100%",
    maxWidth: "8.4375rem",
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif", // ✅ Updated
    fontStyle: "light",
    fontWeight: "300", // ✅ Light 300
    fontSize: "clamp(0.9375rem, 3.8vw, 1.0625rem)", // ✅ CHANGED: from clamp(0.875rem, 3.5vw, 1rem) - larger font
    lineHeight: "1.125rem",
    textAlign: "right",
    color: "#681F02",
    margin: "0.1rem 0rem",
  },

  frame265: {
    width: "100%",
    maxWidth: "8.4375rem",
    height: "1.1875rem",
    flex: "none",
    order: 2,
    flexGrow: 0,
    position: "relative",
  },

  bodyL: {
    position: "absolute",
    width: "100%",
    maxWidth: "8.4375rem",
    height: "1.1875rem",
    left: "0",
    top: "0",
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif", // ✅ Updated
    fontStyle: "normal",
    fontWeight: "400", // ✅ Light 300 (for ratio)
    fontSize: "clamp(0.9375rem, 3.8vw, 1.0625rem)", // ✅ CHANGED: from clamp(0.875rem, 3.5vw, 1rem) - larger font
    lineHeight: "1.25rem",
    textAlign: "right",
    color: "#681F02",
    margin: 0,
  },

  progressBarContainer: {
    width: "5rem",
    height: "0.375rem",
    position: "relative",
    flex: "none",
    order: 3,
    flexGrow: 0,
    alignSelf: "flex-start",
    marginTop: "-0.25rem",
  },

  progressBarBackground: {
    position: "absolute",
    left: "0",
    right: "0",
    top: "0",
    width: "100%",
    height: "0.375rem",
    border: "0.1875rem solid #AD4E34",
    borderRadius: "0.1875rem",
  },

  progressBarFill: {
    position: "absolute",
    left: "0",
    top: "0",
    height: "0.375rem",
    border: "0.1875rem solid #681F02",
    borderRadius: "0.1875rem",
    transition: "width 0.3s ease",
  },

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
