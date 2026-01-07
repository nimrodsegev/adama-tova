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

  // Page Title
  pageTitle: {
    fontFamily: "'Arfilit', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "1.5rem", // 24px
    lineHeight: "1.8125rem", // 29px
    color: "#FFFFFF",
    textAlign: "right",
    margin: 0,
    width: "22.375rem", // 358px
  },

  // Activities List
  activitiesList: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.75rem", // 12px
    width: "22.0625rem", // 353px
    maxHeight: "calc(100vh - 21rem)", // 100vh - (top position + header + navbar + padding)
    overflowY: "auto", // Enable vertical scrolling
    overflowX: "hidden", // Prevent horizontal scroll
    paddingBottom: "1rem", // Extra padding at bottom
    scrollbarWidth: "thin", // Thin scrollbar (Firefox)
    scrollbarColor: "rgba(255, 255, 255, 0.3) transparent", // White scrollbar
  },

  // Activity Card Wrapper
  activityCardWrapper: {
    width: "100%",
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
};

export default styles;
