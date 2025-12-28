import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Main Container
  container: {
    width: "100%",
    maxWidth: "24.5625rem",
    minHeight: "53.25rem",
    margin: "0 auto",
    backgroundColor: "#AB4016",
    position: "relative",
    overflowX: "hidden",
    direction: "rtl",
    paddingBottom: "6.25rem",
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

  // Header with Name
  headerText: {
    position: "absolute",
    width: "22rem",
    left: "1.25rem",
    top: "5.6875rem",
    fontFamily: "'Arfilit', sans-serif",
    fontSize: "clamp(2rem, 6vw, 2.25rem)",
    fontWeight: "400",
    lineHeight: "1.875rem",
    color: "#FFFFFF",
    textAlign: "right",
    margin: 0,
  },

  // ✅ UPDATED: Subtitle "המרחב כאן בשבילך" - closer to name
  subtitle: {
    position: "absolute",
    width: "22rem",
    left: "1.25rem",
    top: "8rem", // ✅ CHANGED: from 8.5rem to 8rem - closer to name
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontWeight: "300",
    fontStyle: "normal",
    fontSize: "1.125rem", // 18px
    lineHeight: "100%",
    color: "#FFFFFF",
    textAlign: "right",
    margin: 0,
  },

  // ✅ UPDATED: Status Message - adjusted position
  statusMessage: {
    position: "absolute",
    width: "22rem",
    left: "1.25rem",
    top: "10.25rem", // ✅ CHANGED: from 10.75rem to 10.25rem
    fontFamily: "'Arfilit', sans-serif",
    fontWeight: "400",
    fontStyle: "normal",
    fontSize: "0.725rem", // 11.6px
    lineHeight: "1rem", // 16px
    letterSpacing: "0%",
    color: "#FFFFFF",
    textAlign: "right",
    margin: 0,
  },

  // Main Content Frame
  mainContentFrame: {
    marginTop: "13rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    padding: "0 1.25rem",
  },

  // Section Container
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },

  // Section Title
  sectionTitle: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1.25rem",
    fontWeight: "400",
    lineHeight: "1.25rem",
    color: "#FFFFFF",
    textAlign: "right",
    margin: 0,
  },

  // Horizontal Scroll Container
  horizontalScroll: {
    display: "flex",
    flexDirection: "row",
    gap: "0.75rem",
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: "0.625rem",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255,255,255,0.3) transparent",
  },

  // Glass Card for Activities
  glassCard: {
    minWidth: "10.4375rem",
    height: "9.625rem",
    maxHeight: "9.625rem", // ✅ ADDED: Prevent card from growing vertically
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(0.4rem)",
    WebkitBackdropFilter: "blur(0.4rem)",
    borderRadius: "1.25rem",
    padding: "0.75rem",
    flexShrink: 0,
    overflow: "hidden", // ✅ ADDED: Prevent content overflow
  },

  // Empty Text
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
