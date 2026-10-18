import { SymbolView } from "expo-symbols";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";

import {
  CURRENCIES,
  CurrencyInfo,
  getCurrencyInfo,
} from "@/constants/currencies";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";

interface CurrencyPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCurrency?: (currency: CurrencyInfo) => void;
}

export function CurrencyPickerModal({
  visible,
  onClose,
  onSelectCurrency,
}: CurrencyPickerModalProps) {
  const { isDark } = useAppTheme();
  const { profile, updateCurrency } = useExpense();

  const currentInfo = getCurrencyInfo(profile.currency);

  const handleSelect = (item: CurrencyInfo) => {
    updateCurrency(item.symbol);
    onSelectCurrency?.(item);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/60 items-center justify-center p-4"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-[380px] rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/10 p-5 gap-4 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-1 border-b border-black/5 dark:border-white/10">
            <View>
              <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                Select Currency
              </Text>
              {/* <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                Updates all cards and metrics across the app
              </Text> */}
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="w-8 h-8 rounded-full items-center justify-center bg-black/5 dark:bg-white/10 active:opacity-70"
            >
              <SymbolView
                name={{ ios: "xmark", android: "close", web: "close" }}
                size={16}
                tintColor={isDark ? "#E4E5EB" : "#1E1F24"}
              />
            </Pressable>
          </View>

          {/* Currency List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          >
            {CURRENCIES.map((item) => {
              const isSelected =
                currentInfo.symbol === item.symbol ||
                currentInfo.code === item.code;

              return (
                <Pressable
                  key={item.code}
                  onPress={() => handleSelect(item)}
                  className={`flex-row items-center justify-between p-3.5 rounded-2xl border transition-all active:opacity-80 ${
                    isSelected
                      ? "bg-brand-perano/15 border-brand-perano dark:bg-brand-perano/20 dark:border-brand-perano"
                      : "bg-surface-light dark:bg-chip-dark border-black/5 dark:border-white/5"
                  }`}
                >
                  {/* Left: Flag + Code + Name */}
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full overflow-hidden bg-black/5 dark:bg-white/10 items-center justify-center border border-black/5 dark:border-white/10 shadow-2xs">
                      <Image
                        source={item.flag}
                        className="w-8 h-8 rounded-full"
                        resizeMode="cover"
                      />
                    </View>

                    <View>
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                          {item.code}
                        </Text>
                        <Text className="text-xs font-semibold text-brand-perano">
                          ({item.symbol})
                        </Text>
                      </View>
                      <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                        {item.name}
                      </Text>
                    </View>
                  </View>

                  {/* Right: Checkmark indicator if active */}
                  {isSelected ? (
                    <View className="w-6 h-6 rounded-full bg-brand-perano items-center justify-center shadow-xs">
                      <SymbolView
                        name={{
                          ios: "checkmark",
                          android: "check",
                          web: "check",
                        }}
                        size={14}
                        tintColor="#FFFFFF"
                      />
                    </View>
                  ) : (
                    <Text className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark px-2">
                      {item.symbol}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
