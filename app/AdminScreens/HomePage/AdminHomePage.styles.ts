import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Main Container
  container: {
    width: "100%",
    maxWidth: "24.5625rem", // 393px → rem
    minHeight: "53.25rem", // 852px → rem
    margin: "0 auto",
    position: "relative",
    overflowX: "hidden",
    direction: "rtl",
    paddingBottom: "6.25rem", // 100px → rem
  },

  // Loading Text
  loadingText: {
    color: "white",
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1.125rem", // 18px
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
    border: "0.125rem solid rgba(189, 161, 201, 0.2)", // 2px → rem
    borderRadius: "50%",
    pointerEvents: "none",
  },

  // Header with Name - Arfilit Regular 400
  headerText: {
    position: "absolute",
    width: "22rem", // 352px → rem
    left: "1.25rem", // 20px → rem
    top: "5.6875rem", // 91px → rem
    fontFamily: "'Arfilit', sans-serif", // ✅ Arfilit Regular 400
    fontSize: "clamp(2rem, 6vw, 2.25rem)", // Responsive: 32px - 36px
    fontWeight: "400", // ✅ Regular
    lineHeight: "1.875rem", // 30px → rem
    color: "#FFFFFF",
    textAlign: "right",
    margin: 0,
  },

  // Main Content Frame
  mainContentFrame: {
    marginTop: "11rem", // 200px → rem
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem", // 40px → rem
    padding: "0 1.25rem", // 0 20px → rem
  },

  // Section Container
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem", // 12px → rem
  },

  // Section Title - Ezer Shemesh TRIAL ONLY Regular 400
  sectionTitle: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif", // ✅ Ezer Shemesh Regular 400
    fontSize: "1.25rem", // 20px → rem
    fontWeight: "400", // ✅ Regular
    lineHeight: "1.25rem", // 20px → rem
    color: "#FFFFFF",
    textAlign: "right",
    margin: 0,
  },

  // Horizontal Scroll Container - FIXED: No vertical scroll
  horizontalScroll: {
    display: "flex",
    flexDirection: "row",
    gap: "0.75rem", // 12px → rem
    overflowX: "auto", // ✅ Horizontal scroll only
    overflowY: "hidden", // ✅ No vertical scroll
    paddingBottom: "0.625rem", // 10px → rem
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255,255,255,0.3) transparent",
    // ✅ Prevent vertical expansion
    maxHeight: "10.25rem", // 164px (card height 154px + padding 10px)
    alignItems: "flex-start", // ✅ Align cards to top
  },

  // Glass Card for Activities
  glassCard: {
    minWidth: "10.4375rem", // 167px → rem
    height: "9.625rem", // 154px → rem
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(0.4rem)", // 6.4px → rem
    WebkitBackdropFilter: "blur(0.4rem)",
    borderRadius: "1.25rem", // 20px → rem
    padding: "0.75rem", // 12px → rem
    flexShrink: 0,
  },

  // Notifications List - Now just container for NotificationCard components
  notificationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem", // 12px → rem
    maxHeight: "12rem", // Maximum height (400px)
    overflowY: "auto", // Enable vertical scroll
    paddingRight: "0.25rem", // Space for scrollbar
    scrollbarWidth: "thin", // Thin scrollbar (Firefox)
    scrollbarColor: "rgba(104, 31, 2, 0.3) transparent",
    marginBottom: "0.7rem",
  },

  // CTA Row (Button Container)
  ctaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0rem", // Buttons closer to content
  },

  // Navigation Bar
  navBar: {
    position: "fixed",
    bottom: "1.25rem", // 20px → rem
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    maxWidth: "22.0625rem", // 353px → rem
    height: "3.8125rem", // 61px → rem
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(0.625rem)", // 10px → rem
    WebkitBackdropFilter: "blur(0.625rem)",
    borderRadius: "1.25rem", // 20px → rem
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 1000,
  },

  // Navigation Item
  navItem: {
    fontSize: "1.5rem", // 24px → rem
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },

  // Empty Text - REMOVED (now using EmptyState component)
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
