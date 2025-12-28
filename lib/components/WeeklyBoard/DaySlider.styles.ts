import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Container for all days
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "23.1875rem", // 371px
    height: "3.6875rem", // 59px
    position: "relative",
  },

  // Individual Day Button (unselected)
  dayButton: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.5rem 0.6875rem", // 8px 11px
    gap: "0.3125rem", // 5px
    background: "transparent",
    border: "none",
    borderRadius: "56.25rem", // 900px (pill shape)
    cursor: "pointer",
    transition: "all 0.2s ease",
    flex: "none",
  },

  // Selected Day Button - WHITE background
  dayButtonSelected: {
    background: "rgba(249, 249, 249, 0.7)", // ✅ CHANGED: Added transparency (0.6 = 60% opacity)
    paddingTop: "0.8rem", // ✅ CHANGED: More vertical padding for taller oval (14px, was 10px)
    paddingBottom: "0.8rem", // ✅ ADDED: Increase vertical padding for oval shape (10px)
  },

  // Day Letter (א, ב, ג, etc.) - unselected
  dayLetter: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "300",
    fontSize: "1rem", // 16px
    lineHeight: "1.0625rem", // 17px
    textAlign: "center",
    color: "rgba(255, 245, 245, 0.7)", // LightGreyTypo
    flex: "none",
    order: 0,
    flexGrow: 0,
  },

  // Day Letter - selected (RED/BROWN)
  dayLetterSelected: {
    color: "#681F02", // ✅ CHANGED: DarkTypo red-brown color (was #F9F9F9 white)
  },

  // Day Letter - closed (black)
  dayLetterClosed: {
    color: "#681F02", // DarkTypo (black/dark brown)
  },

  // Date Container
  dateContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 0.5rem", // 0px 8px
    gap: "0.625rem", // 10px
    minWidth: "1.75rem", // Ensure enough space for date
    borderRadius: "62.4375rem", // 999px
    flex: "none",
    order: 1,
    flexGrow: 0,
  },

  // Date Number (1-31) - unselected
  dateNumber: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "300",
    fontSize: "1rem", // 16px
    lineHeight: "1.0625rem", // 17px
    textAlign: "center",
    color: "rgba(255, 245, 245, 0.7)", // LightGreyTypo
    flex: "none",
    order: 0,
    flexGrow: 0,
  },

  // Date Number - selected (RED/BROWN)
  dateNumberSelected: {
    color: "#681F02", // ✅ CHANGED: DarkTypo red-brown color (was #F9F9F9 white)
  },

  // Date Number - closed (black)
  dateNumberClosed: {
    color: "#681F02", // DarkTypo (black/dark brown)
  },
};

export default styles;
