import { BottomSheet, RNHostView } from "@expo/ui";
import { View } from "react-native";

import ProfileScreen from "@/app/profile";
import { useAppTheme } from "@/context/theme-context";

interface ProfileSheetModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileSheetModal({
  visible,
  onClose,
}: ProfileSheetModalProps) {
  const { isDark } = useAppTheme();

  return (
    <BottomSheet
      isPresented={visible}
      onDismiss={onClose}
      snapPoints={["full"]}
      showDragIndicator
      containerColor={isDark ? "#121316" : "#FFFFFF"}
      contentPadding={0}
    >
      <RNHostView matchContents={false}>
        <View className="flex-1 bg-surface-light dark:bg-surface-dark">
          <ProfileScreen onClose={onClose} />
        </View>
      </RNHostView>
    </BottomSheet>
  );
}
