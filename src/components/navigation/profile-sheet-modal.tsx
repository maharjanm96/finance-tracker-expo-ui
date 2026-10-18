import { Modal, View } from "react-native";

import ProfileScreen from "@/app/profile";

interface ProfileSheetModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileSheetModal({
  visible,
  onClose,
}: ProfileSheetModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-bg-light dark:bg-bg-dark">
        <ProfileScreen onClose={onClose} />
      </View>
    </Modal>
  );
}
