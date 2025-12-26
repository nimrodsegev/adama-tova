import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Main Container
  container: {
    width: "100%",
    maxWidth: "24.5625rem", // 393px
    minHeight: "53.25rem", // 852px
    margin: "0 auto",
    backgroundColor: "#AB4016",
    position: "relative",
    overflowX: "hidden",
    direction: "rtl",
    paddingBottom: "6.25rem", // 100px
  },

  // Loading Text
  loadingText: {
    color: "white",
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1.125rem",
    textAlign: "center",
    paddingTop: "3rem",
  },

  // Background Decoration
  vectorBackground: {
    position: "absolute",
    width: "150%",
    height: "40%",
    top: "2.5%",
    left: "-25%",
    border: "0.125rem solid rgba(189, 161, 201, 0.2)",
    borderRadius: "50%",
    pointerEvents: "none",
  },

  // Header - Arfilit Regular 400 - RIGHT SIDE
  headerText: {
    position: "absolute",
    width: "auto", // Allow natural width
    right: "1.25rem", // ✅ CHANGED: Position from RIGHT
    left: "auto", // Remove left positioning
    top: "5.5625rem", // 89px
    fontFamily: "'Arfilit', sans-serif",
    fontSize: "1.5rem", // 24px
    fontWeight: "400",
    lineHeight: "1.8125rem", // 29px
    color: "#FFFFFF",
    textAlign: "right",
    margin: 0,
  },

  // Main Content Frame
  mainContentFrame: {
    marginTop: "7.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem", // 24px
    padding: "0 1.25rem", // 0 20px
  },

  // Filter Container - LEFT SIDE
  filterContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // ✅ CHANGED: Align to LEFT
    gap: "0.75rem", // 12px
    width: "100%",
  },

  // Filter Button
  filterButton: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1rem", // 16px
    fontWeight: "300",
    lineHeight: "1.0625rem", // 17px
    color: "#F9F9F9",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0.5rem 0",
    textAlign: "left", // ✅ CHANGED: Left align for left side
    transition: "all 0.2s ease",
  },

  // Active Filter Button
  filterButtonActive: {
    textDecoration: "underline",
    fontWeight: "400",
  },

  // Notifications List - Scrollable
  notificationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem", // 12px
    maxHeight: "33rem", // ~504px (fits 6-7 notifications)
    overflowY: "auto",
    paddingRight: "0.25rem",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
    marginBottom: "0.5rem", // ✅ CHANGED: Reduced from 1rem to 0.5rem
  },

  // Empty Text
  emptyText: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1rem",
    fontWeight: "300",
    color: "rgba(255, 245, 245, 0.7)",
    textAlign: "center",
    width: "100%",
    padding: "2rem 0",
  },

  // Button Container - CLOSER TO MESSAGES
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: "0rem", // ✅ CHANGED: Removed margin (was 1rem)
  },

  // Add Notification Button
  addButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.25rem 0", // 4px 0
    gap: "0.625rem", // 10px
    width: "7.5rem", // 120px
    height: "2.75rem", // 44px
    background: "#F9F9F9",
    borderRadius: "1.5625rem", // 25px
    textDecoration: "none",
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
    textAlign: "center",
    color: "#681F02",
    transition: "transform 0.2s ease",
  },

  // Navigation Bar
  navBar: {
    position: "fixed",
    bottom: "1.25rem", // 20px
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    maxWidth: "22.0625rem", // 353px
    height: "3.8125rem", // 61px
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(0.625rem)",
    WebkitBackdropFilter: "blur(0.625rem)",
    borderRadius: "1.25rem",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 1000,
  },

  // Navigation Item
  navItem: {
    fontSize: "1.5rem",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
};

export default styles;
