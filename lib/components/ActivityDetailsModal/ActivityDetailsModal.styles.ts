import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  // Overlay backdrop - TRANSPARENT (no color change)
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "transparent",
    zIndex: 999,
    animation: "fadeIn 0.2s ease-in-out",
  },

  // Modal container - FULL SCREEN FROM TOP TO NAVBAR
  modalContainer: {
    position: "fixed",
    top: 0,
    bottom: "6.8125rem", // 61px for navbar - ends above navbar
    left: 0,
    right: 0,
    width: "100%",
    maxWidth: "100vw",
    backgroundColor: "#F28130",
    zIndex: 1000,
    overflowY: "auto",
    overflowX: "hidden",
    animation: "slideUp 0.3s ease-out",
    direction: "rtl",
    margin: "0 auto",
  },

  // Close button (top right)
  closeButton: {
    position: "absolute",
    width: "2.75rem", // 44px
    height: "2.75rem", // 44px
    right: "1.25rem", // 20px
    top: "1.25rem", // 20px
    border: "1px solid #F9F9F9",
    borderRadius: "1.5625rem", // 25px
    background: "transparent",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    zIndex: 10,
    padding: "0.3125rem", // 5px
    transition: "transform 0.2s ease",
  },

  // Content Frame now contains everything including bottom bar
  contentFrame: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    padding: "0 1.25rem",
    paddingBottom: "2rem",
    gap: "1.5rem", // 24px between title, date
    width: "100%",
    maxWidth: "24.5625rem", // 393px
    margin: "0 auto",
    marginTop: "5rem", // Space for close button
  },

  // ✅ ADDED: Image container
  imageContainer: {
    width: "100%",
    height: "12rem", // 192px - adjust based on image aspect ratio
    marginBottom: "0", // No extra margin, gap handles spacing
    borderRadius: "0.75rem", // 12px - rounded corners
    overflow: "hidden",
    border: "0.1rem solid #F9F9F9", // White border
    flex: "none",
  },

  // ✅ ADDED: Activity image
  activityImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover", // Maintains aspect ratio, crops if needed
    display: "block",
  },

  // Title text - EXACT SPECS
  titleText: {
    width: "100%",
    fontFamily: "'Arfilit', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "1.5rem", // 24px
    lineHeight: "100%",
    letterSpacing: "0%",
    textAlign: "right",
    color: "#FFFFFF",
    margin: 0,
  },

  // Date/Time/Location info frame
  dateInfoFrame: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    width: "100%",
  },

  // Date text - EXACT SPECS (second title/text)
  dateText: {
    width: "100%",
    fontFamily: "'Arfilit', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "0.725rem", // 11.6px
    lineHeight: "1rem", // 16px
    letterSpacing: "0%",
    textAlign: "right",
    color: "#FFFFFF",
    margin: 0,
  },

  // Description frame - REMOVED minHeight
  descriptionFrame: {
    width: "100%",
    maxHeight: "20rem",
    overflowY: "auto",
  },

  // Description text - EXACT SPECS
  descriptionText: {
    width: "100%",
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "1rem", // 16px
    lineHeight: "1.2125rem", // 19.4px
    letterSpacing: "0%",
    textAlign: "right",
    color: "#F9F9F9",
    margin: 0,
  },

  // Bottom bar is now a flex child, not separate
  bottomBar: {
    display: "flex",
    flexDirection: "row", // capacity right, button left
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    gap: "1.5rem", // 24px
    marginTop: "0.75rem", // Small gap just for bottom bar (12px)
  },

  // Capacity frame (text + progress bar) - RIGHT SIDE
  capacityFrame: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: "0.375rem", // 6px gap between text and progress bar
    marginBottom: "0.5rem",
  },

  // Capacity text (10/10) - ABOVE RIGHT SIDE OF BAR
  capacityText: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "1rem", // 16px
    lineHeight: "1.1875rem", // 19px
    textAlign: "right",
    color: "#F9F9F9",
    margin: 0,
    alignSelf: "flex-start",
  },

  // Progress bar container - EXACT MATCH to AdminActivityCard
  progressBarContainer: {
    width: "5rem", // 80px
    height: "0.375rem", // 6px
    position: "relative",
    flex: "none",
    alignSelf: "flex-start", // Changed from flex-end to match text alignment in RTL
  },

  // Progress bar background - EXACT MATCH: Light border only, NO backgroundColor
  progressBarBackground: {
    position: "absolute",
    left: "0",
    right: "0",
    top: "0",
    width: "100%",
    height: "0.375rem", // 6px
    border: "0.1875rem solid rgba(255, 255, 255, 0.4)", // Light white border (3px)
    borderRadius: "0.1875rem", // 3px
    backgroundColor: "transparent",
  },

  // Progress bar fill - EXACT MATCH: Darker border only, NO backgroundColor
  progressBarFill: {
    position: "absolute",
    left: "0",
    top: "0",
    height: "0.375rem", // 6px
    border: "0.1875rem solid #681F02", // Dark red/brown border - this is the "fill"
    borderRadius: "0.1875rem", // 3px
    backgroundColor: "transparent",
    transition: "width 0.3s ease",
  },

  // Register button container - LEFT SIDE
  registerButtonContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },

  // Register button
  registerButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.25rem 1rem", // 4px 16px
    gap: "0.625rem", // 10px
    width: "7.375rem", // 118px
    height: "2.75rem", // 44px
    background: "#F9F9F9",
    borderRadius: "1.5625rem", // 25px
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },

  // Register button text
  registerButtonText: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    textAlign: "center",
    color: "#681F02",
  },
  // Add these to your existing styles object:

  // Admin buttons container
  adminButtonsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "0.75rem", // 12px gap between buttons
    width: "100%",
  },

  // Edit button (green-ish)
  editButton: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },

  // Delete button (red-ish)
  deleteButton: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },

  // Admin button text
  adminButtonText: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
    textAlign: "center",
    color: "#681F02",
  },
  // Action buttons container - LEFT SIDE
  actionButtonsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "0.5rem", // 8px gap between buttons
    alignItems: "center",
    justifyContent: "flex-start",
  },
};

export default styles;
