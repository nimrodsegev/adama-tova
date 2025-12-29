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

  // Activities List
  activitiesList: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.75rem", // 12px
    width: "22.0625rem", // 353px
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
    margin: "0 auto 0 1.4rem", // ✅ CHANGED: Left margin pushes it right (in RTL = moves left visually)
    // OR use this alternative:
    // marginRight: "auto",
    // marginLeft: "0.5rem", // ✅ Adjust this value to move more/less (0.5rem, 1rem, 1.5rem, etc.)
  },
};

export default styles;
