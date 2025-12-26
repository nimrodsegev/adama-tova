import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  cardContainer: {
    width: "100%",
    padding: "0.75rem 1rem",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(0.4rem)",
    WebkitBackdropFilter: "blur(0.4rem)",
    borderRadius: "1.25rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.25rem",
    position: "relative",
    direction: "rtl",
    transition: "transform 0.2s ease",
    minHeight: "auto",
  },

  header: {
    display: "flex",
    flexDirection: "row-reverse",
    gap: "0.25rem",
    alignItems: "center",
    width: "100%",
    justifyContent: "flex-end",
  },

  title: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1.25rem",
    fontWeight: "400",
    lineHeight: "1.25rem",
    color: "#681F02",
    textAlign: "right",
    order: 1,
  },

  titleBold: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1.25rem",
    fontWeight: "700",
    lineHeight: "1.25rem",
    color: "#681F02",
    textAlign: "right",
    order: 1,
  },

  pipe: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1.25rem",
    fontWeight: "400",
    lineHeight: "1.25rem",
    color: "#681F02",
    order: 2,
  },

  time: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "0.875rem",
    fontWeight: "400",
    lineHeight: "1.25rem",
    color: "#681F02",
    textAlign: "right",
    order: 3,
  },

  timeBold: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "0.875rem",
    fontWeight: "700",
    lineHeight: "1.25rem",
    color: "#681F02",
    textAlign: "right",
    order: 3,
  },

  message: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1rem",
    fontWeight: "300",
    lineHeight: "1.0625rem",
    color: "#681F02",
    textAlign: "right",
    margin: 0,
    marginTop: "0.125rem",
    width: "100%",
    wordBreak: "break-word",
    whiteSpace: "normal",
  },

  // Mark as Read Button - Left side of card ✅
  markAsReadButton: {
    position: "absolute",
    left: "0.75rem", // 12px from left edge
    top: "50%",
    transform: "translateY(-50%)",
    width: "1.75rem", // 28px
    height: "1.75rem", // 28px
    borderRadius: "50%",
    background: "#F9F9F9",
    border: "0.0625rem solid #681F02", // 1px border
    color: "#681F02",
    fontSize: "1rem", // 16px
    fontWeight: "bold",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,0.1)",
  },

  icon: {
    objectFit: "contain",
  },
};

export default styles;
