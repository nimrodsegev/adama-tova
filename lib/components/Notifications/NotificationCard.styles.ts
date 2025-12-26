import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Card Container - Glass effect matching home page
  cardContainer: {
    width: "100%",
    padding: "0.75rem 1rem", // 12px 16px
    background: "rgba(255, 255, 255, 0.7)", // Glass effect
    backdropFilter: "blur(0.4rem)",
    WebkitBackdropFilter: "blur(0.4rem)",
    borderRadius: "1.25rem", // 20px
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end", // ✅ Align content to RIGHT
    gap: "0.2rem", // 8px
    position: "relative",
    direction: "rtl", // ✅ RTL direction
    transition: "transform 0.2s ease",
  },

  // Header Container - FIXED RTL
  header: {
    display: "flex",
    flexDirection: "row-reverse", // ✅ RTL: title first, then pipe, then time
    gap: "0.25rem", // 4px
    alignItems: "center",
    width: "100%", // ✅ ADDED: Take full width
    justifyContent: "flex-end", // ✅ ADDED: Align to RIGHT
  },

  // Category/Title - Ezer Shemesh Regular 400
  category: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1.25rem", // 20px
    fontWeight: "400",
    lineHeight: "1.25rem",
    color: "#681F02", // Brown theme
    textAlign: "right", // ✅ Text aligned right
    order: 1, // ✅ ADDED: Ensure title comes first in RTL
  },

  // Pipe separator
  pipe: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1.25rem", // 20px
    fontWeight: "400",
    color: "#681F02",
    order: 2, // ✅ ADDED: Pipe in middle
  },

  // Time - Ezer Shemesh Regular 400
  time: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "0.875rem", // 14px
    fontWeight: "400",
    lineHeight: "1.25rem",
    color: "#681F02",
    textAlign: "right", // ✅ Text aligned right
    order: 3, // ✅ ADDED: Time comes last in RTL
  },

  // Message - Ezer Shemesh Light 300
  message: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "1rem", // 16px
    fontWeight: "300", // Light
    lineHeight: "1.0625rem", // 17px
    color: "#681F02",
    textAlign: "right", // ✅ Text starts from right
    margin: 0,
    width: "100%",
    wordBreak: "break-word", // Break long words
    whiteSpace: "normal", // Allow wrapping
  },
};

export default styles;
