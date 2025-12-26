import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Section Container
  section: {
    direction: "rtl",
    marginTop: "1.5rem", // 24px
    marginBottom: "1.5rem", // 24px
    width: "100%",
  },

  // Header Container (Title + View All)
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem", // 12px
  },

  // Section Title - Ezer Shemesh Regular 400
  sectionTitle: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1.25rem", // 20px
    fontWeight: "400",
    lineHeight: "1.25rem",
    color: "#FFFFFF", // White for dark background
    textAlign: "right",
    margin: 0,
  },

  // View All Link (top right)
  viewAllLink: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    color: "#FFFFFF",
    textDecoration: "underline",
    transition: "opacity 0.2s ease",
  },

  // Notifications List Container
  notificationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem", // 12px between cards
  },

  // Empty State Text
  emptyText: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1rem",
    fontWeight: "300",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    padding: "2rem 0",
    margin: 0,
  },

  // View All Button (bottom)
  viewAllButton: {
    display: "block",
    textAlign: "center",
    marginTop: "0.75rem", // 12px
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    color: "#FFFFFF",
    textDecoration: "none",
    transition: "opacity 0.2s ease",
  },
};

export default styles;
