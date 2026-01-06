import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Main Container
  container: {
    width: "100%",
    maxWidth: "24.5625rem", // 393px
    minHeight: "53.25rem", // 852px
    margin: "0 auto",
    backgroundColor: "#F28130",
    position: "relative",
    overflowX: "hidden",
    direction: "rtl",
    paddingBottom: "6.25rem",
  },

  // Main Frame
  mainFrame: {
    position: "absolute",
    width: "23.5rem", // 376px
    left: "0.5625rem", // 9px
    top: "5.4375rem", // 87px
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem", // 24px
  },

  // Header Section
  headerSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.5rem", // 24px
    width: "100%",
  },

  // Top Row (Title on RIGHT + Filter on LEFT) - RTL
  topRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "22.375rem", // 358px
    height: "1.8125rem", // 29px
  },

  // Filter Options (LEFT side in RTL)
  filterRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: "1rem", // 16px
  },

  // Filter Text
  filterText: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "300",
    fontSize: "1rem", // 16px
    lineHeight: "1.0625rem", // 17px
    color: "#F9F9F9",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent", // ✅ No blue tap highlight
  },

  // Filter Text - Active (underlined)
  filterTextActive: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "300",
    fontSize: "1rem", // 16px
    lineHeight: "1.0625rem", // 17px
    color: "#F9F9F9",
    textDecoration: "underline",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent", // ✅ No blue tap highlight
  },

  // Page Title (RIGHT side in RTL)
  pageTitle: {
    fontFamily: "'Arfilit', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "1.5rem", // 24px
    lineHeight: "1.8125rem", // 29px
    color: "#FFFFFF",
    textAlign: "right",
    margin: 0,
  },

  // ✅ Week Navigation Container
  weekNavigation: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem", // 16px
    width: "100%",
    height: "2rem", // 32px
  },

  // ✅ Week Navigation Button
  weekNavButton: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    borderRadius: "50%",
    width: "2rem", // 32px
    height: "2rem", // 32px
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    color: "#FFFFFF",
    transition: "all 0.2s ease",
    WebkitTapHighlightColor: "transparent", // ✅ No blue tap highlight
  },

  // ✅ Week Display Text
  weekDisplay: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "300",
    fontSize: "1rem", // 16px
    lineHeight: "1.0625rem", // 17px
    color: "#FFFFFF",
    textAlign: "center",
    minWidth: "12rem", // Enough space for text
  },

  // Activities List
  activitiesList: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.75rem", // 12px
    width: "22.0625rem", // 353px
    maxHeight: "calc(100vh - 24rem)", // 100vh - (top position + header + navbar + padding)
    overflowY: "auto", // Enable vertical scrolling
    overflowX: "hidden", // Prevent horizontal scroll
    paddingBottom: "1rem", // Extra padding at bottom
    scrollbarWidth: "thin", // Thin scrollbar (Firefox)
    scrollbarColor: "rgba(255, 255, 255, 0.3) transparent", // White scrollbar
  },

  // Empty State
  emptyText: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1rem",
    fontWeight: "300",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    width: "100%",
    padding: "2rem 0",
  },

  // Closed Day Message
  closedMessage: {
    boxSizing: "border-box",
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1.05rem", // 20px
    fontWeight: "400",
    color: "#FFFFFF",
    textAlign: "center",
    width: "80%",
    maxWidth: "22.0625rem",
    padding: "0.75rem 2rem",
    border: "0.0625rem solid #FFFFFF",
    borderRadius: "1.25rem",
    margin: "0 auto 0 1.4rem",
  },
};

export default styles;
