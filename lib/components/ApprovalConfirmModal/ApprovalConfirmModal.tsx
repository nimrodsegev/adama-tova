"use client";

import { useState } from "react";
import { useIvrita } from "@/app/contexts/IvritaContext";
import Popup from "@/lib/components/UI/Popup";

interface ApprovalConfirmModalProps {
  isOpen: boolean;
  userName: string;
  action: "approve" | "reject";
  type: "initial" | "group";
  onConfirm: () => void;
  onClose: () => void;
}

export default function ApprovalConfirmModal({
  isOpen,
  userName,
  action,
  type,
  onConfirm,
  onClose,
}: ApprovalConfirmModalProps) {
  const { t } = useIvrita();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Get the title text based on action and type
  const getTitleText = () => {
    const areYouSure = t("האם את/ה בטוח/ה");
    if (action === "approve") {
      if (type === "initial") {
        return `${areYouSure} שברצונך לאשר את בקשת ${userName} לאישור ראשוני?`;
      } else {
        return `${areYouSure} שברצונך לאשר את בקשת ${userName} להצטרפות לקבוצה?`;
      }
    } else {
      if (type === "initial") {
        return `${areYouSure} שברצונך לסרב לבקשת ${userName} לאישור ראשוני?`;
      } else {
        return `${areYouSure} שברצונך לסרב לבקשת ${userName} להצטרפות לקבוצה?`;
      }
    }
  };

  // Get the subtitle text based on action and type
  const getSubtitleText = () => {
    if (action === "approve") {
      if (type === "initial") {
        return "פעולה זו תאפשר למשתמש לקבל גישה לאפליקציה";
      } else {
        return "פעולה זו תאפשר למשתמש להשתתף בפעילות זו";
      }
    } else {
      if (type === "initial") {
        return "פעולה זו תמנע מהמשתמש לקבל גישה לאפליקציה";
      } else {
        return "פעולה זו תמנע מהמשתמש להשתתף בפעילות זו";
      }
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popup
      content={getTitleText()}
      recommendation={getSubtitleText()}
      primaryButtonText={t("כן אני בטוח/ה")}
      primaryButtonAction={handleConfirm}
      loading={loading}
      secondaryButtonText="ביטול"
      secondaryButtonAction={onClose}
      onClose={onClose}
    />
  );
}
