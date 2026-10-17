import { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import HomeScreen from "@/app/index";
import ProfileScreen from "@/app/profile";
import AnalyticsScreen from "@/app/search";
import TransactionsScreen from "@/app/transactions";
import { AddTransactionModal } from "@/components/add-transaction-modal";
import { CreateAccountModal } from "@/components/create-account-modal";
import { AccountSelectorSheet } from "@/components/navigation/account-selector-sheet";
import { BottomFloatingBar } from "@/components/navigation/bottom-floating-bar";
import { TopChipHeader } from "@/components/navigation/top-chip-header";
import { useAppTheme } from "@/context/theme-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AppTabs() {
  const { isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const handleSelectTab = (index: number) => {
    setActiveTab(index);
    scrollRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (pageIndex >= 0 && pageIndex <= 3 && pageIndex !== activeTab) {
      setActiveTab(pageIndex);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // If the user starts searching and isn't on Transactions, automatically slide to Transactions
    if (query.trim().length > 0 && activeTab !== 1) {
      handleSelectTab(1);
    }
  };

  return (
    <View
      className="flex-1 bg-bg-light dark:bg-bg-dark"
      style={styles.container}
    >
      {/* ─── Top Phantom Chip Navigation Header ─── */}
      <TopChipHeader
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onPressWallet={() => setShowAccountSheet(true)}
      />

      {/* ─── Horizontal Swiping Screen Pager ─── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        style={styles.pagerScrollView}
      >
        {/* Screen 0: Home */}
        <View style={{ width: SCREEN_WIDTH }}>
          <HomeScreen
            onNavigateToTab={handleSelectTab}
            onOpenAddTransaction={() => setShowAddModal(true)}
          />
        </View>

        {/* Screen 1: Transactions */}
        <View style={{ width: SCREEN_WIDTH }}>
          <TransactionsScreen
            externalSearchQuery={searchQuery}
            onOpenAddTransaction={() => setShowAddModal(true)}
          />
        </View>

        {/* Screen 2: Analytics */}
        <View style={{ width: SCREEN_WIDTH }}>
          <AnalyticsScreen />
        </View>

        {/* Screen 3: Profile */}
        <View style={{ width: SCREEN_WIDTH }}>
          <ProfileScreen />
        </View>
      </ScrollView>

      {/* ─── Bottom Floating Stadium Search Bar & Plus Button ─── */}
      <BottomFloatingBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onPressAdd={() => setShowAddModal(true)}
        onFocusSearch={() => {
          if (activeTab !== 1) {
            handleSelectTab(1);
          }
        }}
      />

      {/* ─── Global Add Transaction Modal ─── */}
      <AddTransactionModal
        visible={showAddModal}
        initialType="expense"
        onClose={() => setShowAddModal(false)}
      />

      {/* ─── "Combined Account ⌵" Account Selector Bottom Sheet ─── */}
      <AccountSelectorSheet
        visible={showAccountSheet}
        onClose={() => setShowAccountSheet(false)}
        onOpenCreateAccount={() => setShowCreateAccountModal(true)}
      />

      {/* ─── Add New Account Modal ─── */}
      <CreateAccountModal
        visible={showCreateAccountModal}
        onClose={() => setShowCreateAccountModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  pagerScrollView: {
    flex: 1,
  },
});
