import { BottomSheet, RNHostView } from "@expo/ui";
import type { SymbolViewProps } from "expo-symbols";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { Goal } from "@/domain/types";

export type SymbolName = Extract<SymbolViewProps["name"], { ios?: any }>;

export interface GoalCategoryOption {
  label: string;
  icon: {
    ios: NonNullable<SymbolName["ios"]>;
    android: NonNullable<SymbolName["android"]>;
    web: NonNullable<SymbolName["web"]>;
  };
  color: string;
}

export const GOAL_CATEGORIES: GoalCategoryOption[] = [
  {
    label: "Emergency",
    icon: { ios: "shield.fill", android: "security", web: "security" },
    color: "#3B82F6",
  },
  {
    label: "Tech",
    icon: { ios: "laptopcomputer", android: "laptop", web: "laptop" },
    color: "#8B5CF6",
  },
  {
    label: "Travel",
    icon: { ios: "airplane", android: "flight", web: "flight" },
    color: "#06B6D4",
  },
  {
    label: "Vehicle",
    icon: { ios: "car.fill", android: "directions_car", web: "directions_car" },
    color: "#F59E0B",
  },
  {
    label: "Home",
    icon: { ios: "house.fill", android: "home", web: "home" },
    color: "#10B981",
  },
  {
    label: "Education",
    icon: { ios: "graduationcap.fill", android: "school", web: "school" },
    color: "#EC4899",
  },
  {
    label: "Invest",
    icon: {
      ios: "chart.line.uptrend.xyaxis",
      android: "trending_up",
      web: "trending_up",
    },
    color: "#6366F1",
  },
  {
    label: "Dream",
    icon: { ios: "star.fill", android: "star", web: "star" },
    color: "#EAB308",
  },
  {
    label: "General",
    icon: { ios: "target", android: "track_changes", web: "track_changes" },
    color: "#AB9FF2",
  },
];

interface CreateGoalModalProps {
  visible: boolean;
  onClose: () => void;
  goal?: Goal | null;
}

function CreateGoalForm({
  goal,
  onClose,
}: {
  goal?: Goal | null;
  onClose: () => void;
}) {
  const { addGoal, editGoal, deleteGoal, currencySymbol } = useExpense();
  const { isDark } = useAppTheme();

  const isEditing = Boolean(goal);

  const [title, setTitle] = useState(goal?.title ?? "");
  const [amount, setAmount] = useState(
    goal ? (goal.targetAmount > 0 ? goal.targetAmount.toString() : "") : "",
  );
  const [isActive, setIsActive] = useState(goal?.isActive ?? true);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    goal?.category ?? "General",
  );

  const activeCategoryMeta =
    GOAL_CATEGORIES.find((c) => c.label === selectedCategory) ??
    GOAL_CATEGORIES[GOAL_CATEGORIES.length - 1];

  const handleQuickAdd = (value: number) => {
    const current = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
    setAmount((current + value).toString());
  };

  const handleSave = () => {
    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
    if (title.trim().length === 0 || parsedAmount <= 0) return;

    if (isEditing && goal) {
      editGoal(goal.id, {
        title: title.trim(),
        targetAmount: parsedAmount,
        isActive,
        category: selectedCategory,
        icon: activeCategoryMeta.icon.ios,
      });
    } else {
      addGoal({
        title: title.trim(),
        targetAmount: parsedAmount,
        isActive,
        category: selectedCategory,
        icon: activeCategoryMeta.icon.ios,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!goal) return;
    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete "${goal.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteGoal(goal.id);
            onClose();
          },
        },
      ],
    );
  };

  const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
  const isSaveReady = title.trim().length > 0 && parsedAmount > 0;

  return (
    <View className="flex-1 bg-surface-light dark:bg-surface-dark px-5 pt-3 pb-6 gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between pt-1.5">
        <Text className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          {isEditing ? "Edit Goal" : "New Savings Goal"}
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          className="p-1 active:opacity-70"
        >
          <SymbolView
            name={{
              ios: "xmark.circle.fill",
              android: "cancel",
              web: "cancel",
            }}
            size={24}
            tintColor={isDark ? "#989BA5" : "#AEAEB2"}
          />
        </Pressable>
      </View>

      {/* Target Amount Input */}
      <View className="flex-row items-center justify-center py-2">
        <Text className="text-3xl font-bold text-[#AB9FF2] mr-2">
          {currencySymbol}
        </Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          placeholderTextColor={isDark ? "#484B56" : "#C7C7CC"}
          keyboardType="numeric"
          className="text-4xl font-extrabold text-text-primary-light dark:text-text-primary-dark tracking-tight"
          style={{ minWidth: 100 }}
        />
      </View>

      {/* Quick Amount Pills */}
      <View className="flex-row items-center justify-center gap-2">
        {[25000, 50000, 100000, 500000].map((val) => (
          <Pressable
            key={val}
            onPress={() => handleQuickAdd(val)}
            className="px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 active:opacity-60"
          >
            <Text className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
              +{val >= 100000 ? `${val / 100000}L` : `${val / 1000}k`}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 16 }}
      >
        {/* Goal Title Input */}
        <View className="gap-2">
          <Text className="text-[11px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
            GOAL NAME
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Emergency Buffer, Vacation, New Car"
            placeholderTextColor={isDark ? "#989BA5" : "#AEAEB2"}
            className="w-full px-4 py-3.5 rounded-2xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/10 text-[15px] font-medium text-text-primary-light dark:text-text-primary-dark"
          />
        </View>

        {/* Active Goal Toggle */}
        <View className="p-4 rounded-2xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/10 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center gap-2">
              <SymbolView
                name={{
                  ios: "star.fill",
                  android: "star",
                  web: "star",
                }}
                size={16}
                tintColor="#AB9FF2"
              />
              <Text className="text-[14px] font-bold text-text-primary-light dark:text-text-primary-dark">
                Set as Active Goal
              </Text>
            </View>
            <Text className="text-[12px] font-medium text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Active goal is tracked on the Home Monthly Summary and snapshot
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{
              false: isDark ? "#2C2D33" : "#E5E5EA",
              true: "#AB9FF2",
            }}
            thumbColor={isActive ? "#1E1F24" : isDark ? "#A0A0A5" : "#FFFFFF"}
          />
        </View>

        {/* Goal Category / Theme Selector */}
        <View className="gap-2">
          <Text className="text-[11px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
            CATEGORY & ICON
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          >
            {GOAL_CATEGORIES.map((c) => {
              const isSelected = selectedCategory === c.label;
              return (
                <Pressable
                  key={c.label}
                  onPress={() => setSelectedCategory(c.label)}
                  className={`flex-row items-center px-3.5 py-2.5 rounded-2xl gap-2 border ${
                    isSelected
                      ? "bg-brand-perano border-brand-perano"
                      : "bg-card-light dark:bg-card-dark border-black/5 dark:border-white/10"
                  }`}
                >
                  <SymbolView
                    name={{
                      ios: c.icon.ios,
                      android: c.icon.android,
                      web: c.icon.web,
                    }}
                    size={14}
                    tintColor={
                      isSelected ? "#1E1F24" : isDark ? "#E4E5EB" : "#1E1F24"
                    }
                  />
                  <Text
                    className={`text-[13px] ${
                      isSelected
                        ? "text-[#1E1F24] font-bold"
                        : "text-text-secondary-light dark:text-text-secondary-dark font-medium"
                    }`}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="gap-2.5 mt-2">
        <AppButton
          title={isEditing ? "Save Changes" : "Create Goal"}
          icon={{
            ios: isEditing ? "checkmark" : "plus",
            android: isEditing ? "check" : "add",
            web: isEditing ? "check" : "add",
          }}
          onPress={handleSave}
          disabled={!isSaveReady}
        />

        {isEditing && (
          <AppButton
            title="Delete Goal"
            variant="danger"
            icon={{ ios: "trash.fill", android: "delete", web: "delete" }}
            iconSize={18}
            onPress={handleDelete}
          />
        )}
      </View>
    </View>
  );
}

export function CreateGoalModal({
  visible,
  onClose,
  goal,
}: CreateGoalModalProps) {
  const { isDark } = useAppTheme();

  return (
    <BottomSheet
      isPresented={visible}
      onDismiss={onClose}
      snapPoints={["full"]}
      showDragIndicator
      containerColor={isDark ? "#18191D" : "#FFFFFF"}
      contentPadding={0}
    >
      <RNHostView matchContents={false}>
        {visible ? (
          <CreateGoalForm
            key={goal?.id ?? "new"}
            goal={goal}
            onClose={onClose}
          />
        ) : (
          <View />
        )}
      </RNHostView>
    </BottomSheet>
  );
}
