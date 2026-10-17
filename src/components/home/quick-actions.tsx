// import { SymbolView } from "expo-symbols";
// import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

// import { useAppTheme } from "@/context/theme-context";
// import { TransactionType } from "@/domain/types";

// interface QuickActionsProps {
//   onSelectAction: (type: TransactionType) => void;
// }

// export function QuickActions({ onSelectAction }: QuickActionsProps) {
//   const { isDark } = useAppTheme();

//   return (
//     <View style={styles.container}>
//       {/* 1. Add Expense */}
//       <Pressable
//         onPress={() => onSelectAction("expense")}
//         style={({ pressed }) => [
//           styles.actionButton,
//           isDark ? styles.cardDark : styles.cardLight,
//           pressed && styles.pressed,
//         ]}
//       >
//         <View
//           style={[
//             styles.iconWrap,
//             { backgroundColor: isDark ? "rgba(255, 59, 48, 0.15)" : "#FFF1F0" },
//           ]}
//         >
//           <SymbolView
//             name={{
//               ios: "arrow.up.right",
//               android: "arrow_outward",
//               web: "arrow_outward",
//             }}
//             size={16}
//             tintColor="#FF3B30"
//           />
//         </View>
//         <Text
//           style={[
//             styles.actionLabel,
//             isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
//           ]}
//         >
//           Expense
//         </Text>
//       </Pressable>

//       {/* 2. Add Income */}
//       <Pressable
//         onPress={() => onSelectAction("income")}
//         style={({ pressed }) => [
//           styles.actionButton,
//           isDark ? styles.cardDark : styles.cardLight,
//           pressed && styles.pressed,
//         ]}
//       >
//         <View
//           style={[
//             styles.iconWrap,
//             {
//               backgroundColor: isDark ? "rgba(46, 192, 139, 0.15)" : "#ECFDF5",
//             },
//           ]}
//         >
//           <SymbolView
//             name={{
//               ios: "arrow.down.left",
//               android: "call_received",
//               web: "call_received",
//             }}
//             size={16}
//             tintColor="#2EC08B"
//           />
//         </View>
//         <Text
//           style={[
//             styles.actionLabel,
//             isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
//           ]}
//         >
//           Income
//         </Text>
//       </Pressable>

//       {/* 3. Transfer */}
//       <Pressable
//         onPress={() => onSelectAction("transfer")}
//         style={({ pressed }) => [
//           styles.actionButton,
//           isDark ? styles.cardDark : styles.cardLight,
//           pressed && styles.pressed,
//         ]}
//       >
//         <View
//           style={[
//             styles.iconWrap,
//             {
//               backgroundColor: isDark ? "rgba(171, 159, 242, 0.15)" : "#F5F2FF",
//             },
//           ]}
//         >
//           <SymbolView
//             name={{
//               ios: "arrow.left.arrow.right",
//               android: "sync_alt",
//               web: "sync_alt",
//             }}
//             size={16}
//             tintColor="#AB9FF2"
//           />
//         </View>
//         <Text
//           style={[
//             styles.actionLabel,
//             isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
//           ]}
//         >
//           Transfer
//         </Text>
//       </Pressable>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     gap: 10,
//     width: "100%",
//   },
//   actionButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     paddingHorizontal: 8,
//     borderRadius: 18,
//     borderWidth: 1,
//     gap: 8,
//     ...Platform.select({
//       ios: {
//         shadowColor: "#000000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.04,
//         shadowRadius: 6,
//       },
//       android: {
//         elevation: 1,
//       },
//     }),
//   },
//   cardDark: {
//     backgroundColor: "#121214",
//     borderColor: "rgba(255, 255, 255, 0.10)",
//   },
//   cardLight: {
//     backgroundColor: "#FFFFFF",
//     borderColor: "rgba(0, 0, 0, 0.08)",
//   },
//   pressed: {
//     opacity: 0.8,
//     transform: [{ scale: 0.98 }],
//   },
//   iconWrap: {
//     width: 28,
//     height: 28,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   actionLabel: {
//     fontSize: 14,
//     fontWeight: "700",
//     letterSpacing: -0.2,
//   },
//   textPrimaryDark: {
//     color: "#FFFFFF",
//   },
//   textPrimaryLight: {
//     color: "#000000",
//   },
// });
