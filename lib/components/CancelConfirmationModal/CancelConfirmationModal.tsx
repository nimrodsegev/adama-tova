"use client";

import Popup from "@/lib/components/UI/Popup";
import { useIvrita } from "@/app/contexts/IvritaContext";

type CancelConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  activityTitle: string;
  activityDate: string;
  activityTime: string;
};

export default function CancelConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  activityTitle,
  activityDate,
  activityTime,
}: CancelConfirmationModalProps) {
  const { t } = useIvrita();

  if (!isOpen) return null;

  return (
    <Popup
      content={`${t(
        "את/ה בטוח/ה שאת/ה רוצה לבטל את ההרשמה"
      )}\nל${activityTitle} ב${activityDate} בשעה ${activityTime}?`}
      primaryButtonText="לא"
      primaryButtonAction={onClose}
      secondaryButtonText="כן, לבטל"
      secondaryButtonAction={onConfirm}
      onClose={onClose}
    />
  );
}
