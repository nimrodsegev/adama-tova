import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Overlay backdrop
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1999,
    animation: "fadeIn 0.2s ease-in-out",
  },

  // Modal container - PopUp Modal
  modalContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.75rem 1rem", // 12px 16px
    gap: "1.5rem", // 24px
    position: "fixed",
    width: "18.3125rem", // 293px
    height: "9.6875rem", // 155px
    left: "calc(50% - 18.3125rem/2 + 0.03125rem)", // Centered
    top: "calc(50% - 9.6875rem/2 + 0.78125rem)", // Centered
    background: "#E6CAC2",
    borderRadius: "1.25rem", // 20px
    zIndex: 2000,
    animation: "slideUp 0.3s ease-out",
  },

  // Content Frame (question + details)
  contentFrame: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "0",
    gap: "0.5rem", // 8px
    width: "16.3125rem", // 261px
    height: "3.8125rem", // 61px
    flex: "none",
    order: 0,
    alignSelf: "stretch",
    flexGrow: 0,
  },

  // Question text - "את בטוחה שאת רוצה לבטל את ההרשמה?"
  questionText: {
    width: "16.3125rem", // 261px
    height: "0.98rem", // 15.68px
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    textAlign: "center",
    color: "#681F02",
    margin: 0,
    flex: "none",
    order: 0,
    alignSelf: "stretch",
    flexGrow: 0,
  },

  // Details text - Activity name, date, time
  detailsText: {
    width: "16.3125rem", // 261px
    height: "2.5rem", // 40px
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "1.25rem", // 20px
    lineHeight: "1.25rem", // 20px
    textAlign: "center",
    color: "#681F02",
    margin: 0,
    flex: "none",
    order: 1,
    flexGrow: 0,
  },

  // Buttons Frame
  buttonsFrame: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.0625rem 0", // 1px 0px
    gap: "8.6875rem", // 139px
    width: "16.3125rem", // 261px
    height: "2.875rem", // 46px
    flex: "none",
    order: 1,
    alignSelf: "stretch",
    flexGrow: 0,
  },

  // Cancel button (left - "לא")
  cancelButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.25rem 1rem", // 4px 16px
    gap: "0.625rem", // 10px
    width: "2.9375rem", // 47px
    height: "2.75rem", // 44px
    background: "#F9F9F9",
    borderRadius: "1.5625rem", // 25px
    border: "none",
    cursor: "pointer",
    flex: "none",
    order: 0,
    flexGrow: 0,
  },

  // Cancel button text
  cancelButtonText: {
    width: "0.9375rem", // 15px
    height: "1.25rem", // 20px
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    textAlign: "center",
    color: "#681F02",
    flex: "none",
    order: 0,
    flexGrow: 0,
  },

  // Confirm button (right - "ביטול הרשמה")
  confirmButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.25rem 1rem", // 4px 16px
    gap: "0.625rem", // 10px
    width: "4.8125rem", // 77px
    height: "2.75rem", // 44px
    background: "#F9F9F9",
    borderRadius: "1.5625rem", // 25px
    border: "none",
    cursor: "pointer",
    flex: "none",
    order: 1,
    flexGrow: 0,
  },

  // Confirm button text (RED)
  confirmButtonText: {
    width: "2.8125rem", // 45px
    height: "1.25rem", // 20px
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    textAlign: "center",
    color: "#FF0000", // RED
    flex: "none",
    order: 0,
    flexGrow: 0,
  },
};

export default styles;
