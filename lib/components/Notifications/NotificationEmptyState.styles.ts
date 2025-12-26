import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Main Container - Empty State Box
  container: {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.75rem 1rem", // 12px 16px
    gap: "0.75rem", // 12px
    width: "100%",
    maxWidth: "22.0625rem", // 353px
    height: "11.625rem", // 186px
    background: "#AD4E34", // Background color
    border: "0.0625rem solid #F9F9F9", // 1px border
    borderRadius: "1.25rem", // 20px
    flex: "none",
    order: 1,
    flexGrow: 0,
  },

  // Icon Container - Frame 254
  iconContainer: {
    width: "4.4375rem", // 71px
    height: "4.5rem", // 72px
    position: "relative",
    flex: "none",
    order: 0,
    flexGrow: 0,
  },

  // Outer Dashed Circle - Vector
  outerCircle: {
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    border: "0.1375rem dashed rgba(255, 255, 255, 0.5)", // 2.2px dashed
    borderRadius: "50%",
    boxSizing: "border-box",
  },

  // Inner Group - Contains plus sign and inner circle
  innerGroup: {
    position: "absolute",
    width: "3.01rem", // 48.17px
    height: "3.07rem", // 49.15px
    left: "0.714rem", // 11.42px
    top: "0.71rem", // 11.36px
  },

  // Inner Dashed Circle
  innerCircle: {
    position: "absolute",
    left: "16.08%",
    right: "16.08%",
    top: "15.78%",
    bottom: "15.95%",
    border: "0.1375rem dashed rgba(255, 255, 255, 0.5)", // 2.2px dashed
    borderRadius: "50%",
    boxSizing: "border-box",
  },

  // Vertical Line of Plus Sign - Line 11
  verticalLine: {
    position: "absolute",
    width: "0.0625rem", // 1px
    height: "0.954rem", // 15.26px
    left: "50%",
    top: "1.755rem", // 28.09px
    transform: "translateX(-50%)",
    background: "rgba(255, 245, 245, 0.7)", // LightGreyTypo
  },

  // Horizontal Line of Plus Sign - Line 10
  horizontalLine: {
    position: "absolute",
    width: "0.788rem", // 12.61px
    height: "0.0625rem", // 1px
    left: "1.825rem", // 29.2px
    top: "2.25rem", // 36px
    background: "rgba(255, 245, 245, 0.7)", // LightGreyTypo
  },

  // Text Container - Frame 252
  textContainer: {
    width: "100%",
    maxWidth: "22.0625rem", // 353px
    height: "1.25rem", // 20px
    flex: "none",
    order: 1,
    flexGrow: 0,
    position: "relative",
  },

  // Empty State Text
  emptyText: {
    width: "100%",
    height: "1.25rem", // 20px
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "1.25rem", // 20px
    lineHeight: "1.25rem", // 20px
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    textAlign: "center",
    color: "rgba(255, 245, 245, 0.7)", // LightGreyTypo
    margin: 0,
  },

  // Button Container - Frame 253
  buttonContainer: {
    width: "7.5rem", // 120px
    height: "2.75rem", // 44px
    flex: "none",
    order: 2,
    flexGrow: 0,
    position: "relative",
  },

  // Add Button
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
    transition: "transform 0.2s ease",
  },

  // Button Text
  buttonText: {
    width: "7.3125rem", // 117px
    height: "1.25rem", // 20px
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    textAlign: "center",
    color: "#681F02", // DarkTypo
    flex: "none",
    order: 0,
    flexGrow: 0,
  },
};

export default styles;
