import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import AnalyticsScreen from "@/app/analytics";
import HomeScreen from "@/app/index";
import ProfileScreen from "@/app/profile";
import TransactionsScreen from "@/app/transactions";
import { AddTransactionModal } from "@/components/add-transaction-modal";
import { CreateAccountModal } from "@/components/create-account-modal";
import { AccountSelectorSheet } from "@/components/navigation/account-selector-sheet";
import { BottomFloatingBar } from "@/components/navigation/bottom-floating-bar";
import { SearchSheetModal } from "@/components/navigation/search-sheet-modal";
import { TopChipHeader } from "@/components/navigation/top-chip-header";
import { TransactionType } from "@/domain/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AppTabs() {
  // Index 0: Profile, Index 1: Home (Default main page), Index 2: Transactions, Index 3: Analytics
  const [activeTab, setActiveTab] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTransactionType, setAddTransactionType] =
    useState<TransactionType>("expense");
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  // Initialize scroll position on Home (index 1)
  useEffect(() => {
    scrollRef.current?.scrollTo({
      x: SCREEN_WIDTH,
      animated: false,
    });
  }, []);

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

  return (
    <View
      className="flex-1 bg-bg-light dark:bg-bg-dark"
      style={styles.container}
    >
      {/* ─── Horizontal Swiping Screen Pager (Profile, Home, Transactions, Analytics) ─── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentOffset={{ x: SCREEN_WIDTH, y: 0 }}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        style={styles.pagerScrollView}
      >
        {/* Screen 0: Profile (Left side of Home) */}
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <ProfileScreen isTab />
        </View>

        {/* Screen 1: Home (Default main screen) */}
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <HomeScreen
            onNavigateToTab={handleSelectTab}
            onOpenAddTransaction={() => {
              setAddTransactionType("expense");
              setShowAddModal(true);
            }}
            onPressWallet={() => setShowAccountSheet(true)}
          />
        </View>

        {/* Screen 2: Transactions */}
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <TransactionsScreen
            onOpenAddTransaction={() => {
              setAddTransactionType("expense");
              setShowAddModal(true);
            }}
          />
        </View>

        {/* Screen 3: Analytics */}
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <AnalyticsScreen />
        </View>
      </ScrollView>

      {/* ─── Top Floating Frosted Glass Header (Status Bar + Navigation Chips) ─── */}
      <TopChipHeader
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onPressAvatar={() => handleSelectTab(0)}
      />

      {/* ─── Bottom Floating Stadium Search Bar & Plus Button ─── */}
      <BottomFloatingBar
        onPressSearch={() => setShowSearchModal(true)}
        onSelectAction={(type) => {
          setAddTransactionType(type);
          setShowAddModal(true);
        }}
      />

      {/* ─── Search Sheet Modal (Recents + Live Search, matching Phantom) ─── */}
      <SearchSheetModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* ─── Global Add Transaction Modal ─── */}
      <AddTransactionModal
        visible={showAddModal}
        initialType={addTransactionType}
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
