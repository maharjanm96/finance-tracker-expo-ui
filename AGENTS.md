# AGENTS.md — Glass UI Architecture & Engineering Guidelines

This repository is an **Expo (SDK 57+) / React Native** application crafted with a signature **iOS-grade aesthetic running flawlessly across Android, iOS, and Web**.

All AI agents and developers working on this repository must strictly adhere to the standards, design patterns, and engineering practices documented below.

---

## 1. Mandatory First Step: Consult Available Skills (`.agents/skills`)

Before starting any feature, refactor, or dependency addition, **always check and read the matching skill documentation** in `.agents/skills/`:

| Skill                        | Location                                                                                                                       | When to Use                                                                                                   |
| :--------------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **`expo-ui`**                | [`.agents/skills/expo-ui/SKILL.md`](file:///e:/expo-ui/glass-ui/.agents/skills/expo-ui/SKILL.md)                               | Building native UI components (`Host`, `BottomSheet`, `List`, `Switch`, `Slider`, `Menu`, SwiftUI / Compose). |
| **`expo-router`**            | [`.agents/skills/expo-router/SKILL.md`](file:///e:/expo-ui/glass-ui/.agents/skills/expo-router/SKILL.md)                       | Adding screens, layouts, tabs, navigation stacks, dynamic routes, and search bars.                            |
| **`expo-project-structure`** | [`.agents/skills/expo-project-structure/SKILL.md`](file:///e:/expo-ui/glass-ui/.agents/skills/expo-project-structure/SKILL.md) | File organization, placing reusable components vs route files.                                                |
| **`expo-data-fetching`**     | [`.agents/skills/expo-data-fetching/SKILL.md`](file:///e:/expo-ui/glass-ui/.agents/skills/expo-data-fetching/SKILL.md)         | Network requests, caching, server state, and offline management.                                              |

---

## 2. iOS-Style Design System on Android & Cross-Platform

We deliver an authentic, high-end Apple/iOS design language on **both Android and iOS** without relying on platform-locked dependencies that fail on Android.

### A. Floating Capsule Pill Tab Bar ([`src/components/app-tabs.tsx`](file:///e:/expo-ui/glass-ui/src/components/app-tabs.tsx))

- **Visual Design**: A floating rounded pill capsule (`borderRadius: 36`, `height: 66`, `maxWidth: 360`, `alignSelf: 'center'`) floating above the bottom edge.
- **Native iOS Glass & Frosted Blur**:
  - Uses [`NativeGlassView`](file:///e:/expo-ui/glass-ui/src/components/native-glass.tsx) backed by `expo-glass-effect` (`GlassView`) on iOS when Liquid Glass is available, with graceful fallback to `BlurView` (`systemUltraThinMaterialLight`).
  - Outer Capsule Backdrop: `tintColor: "rgba(150, 209, 255, 0.40)"`, `intensity: 90`.
  - Outer Capsule Border: Specular glass highlight rim `1.5px`, `rgba(255, 255, 255, 0.65)`.
  - Active Tab Pill Indicator: Sliding inner glass capsule (`rgba(115, 186, 242, 0.58)`) with `borderRadius: 28` and hairline specular border `rgba(255, 255, 255, 0.50)`.
  - Active Icon & Label: `#025ED3` (Apple system royal blue).
  - Inactive Icon & Label: `#001C4E` (deep midnight navy).
- **Physics**: Uses `Animated.spring` for smooth 60/120fps indicator sliding with zero runtime worklet crashes.
- **Clearance**: Content must include bottom padding: `insets.bottom + BottomTabInset + 32` so content is never covered by the floating pill.

### B. Scroll-Reactive Blurred Status Bar ([`src/components/blurred-status-bar.tsx`](file:///e:/expo-ui/glass-ui/src/components/blurred-status-bar.tsx))

- **Docs Reference**: [Expo BlurView Docs](https://docs.expo.dev/versions/latest/sdk/blur-view/).
- **Behavior**: At the top of the page (`scrollY === 0`), the status bar is 100% transparent. As the user scrolls down, opacity smoothly interpolates from `0 -> 1` over the first 35px.
- **Android Support (`BlurTargetView`)**:
  - On Android 12+ (SDK 31+), native hardware-accelerated blur requires wrapping the scrollable content in `<BlurTargetView ref={blurTargetRef} style={styles.blurTarget}>`.
  - Pass `blurTarget={blurTargetRef}` and `blurMethod="dimezisBlurViewSdk31Plus"` to `<BlurredStatusBar>`.
  - `BlurView` is rendered after `BlurTargetView` in JSX to ensure live blur updates during scrolling.
- **Touch Passthrough**: Uses `pointerEvents="none"` so that scroll gestures and native status-bar taps (scroll-to-top) are never intercepted.

### C. Apple Style Kit ([`src/components/apple-style-kit.tsx`](file:///e:/expo-ui/glass-ui/src/components/apple-style-kit.tsx))

- **Card Groupings**: Inset grouped cards (`backgroundColor: #232326` dark / `#F2F2F7` light, `borderRadius: 24`, hairline borders `rgba(255, 255, 255, 0.06)`).
- **Row Anatomy**: `height: 56`, icon square (`32x32`, `borderRadius: 8`), title (`17px`, `fontWeight: 500`), divider indented to line up with labels (`marginLeft: 62`).
- **Interactive Controls**:
  - `AppleSwitch`: Exact iOS toggle dimensions (`51x31`), smooth spring transition, green active fill `#34C759`.
  - `AppleSignOutDialog`: Action confirmation sheets with non-destructive cancel and red destructive action `#FF453A`.
  - `AppleConnectivityCard`: 2x2 circular pill network grid (Airplane Mode, Cellular, Wi-Fi, Bluetooth).

---

## 3. `@expo/ui` & SwiftUI Guidelines

Reference: [Expo SwiftUI UI Docs](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/) & [`.agents/skills/expo-ui/SKILL.md`](file:///e:/expo-ui/glass-ui/.agents/skills/expo-ui/SKILL.md).

`@expo/ui` provides real native SwiftUI on iOS and Jetpack Compose on Android. When using it, follow these strict architectural rules:

### Priority 1: Use Universal Components by Default

Always import from `@expo/ui` root (never from subpaths unless platform-isolated):

```tsx
import {
  Host,
  BottomSheet,
  Switch,
  Slider,
  List,
  ListItem,
  Column,
  Row,
  Text,
  Button,
} from "@expo/ui";
```

- **Universal components run unmodified on iOS, Android, and Web.**
- Always wrap `@expo/ui` trees in `<Host>`.
- Use `@expo/ui` for `BottomSheet`, native pickers, and grouped form sections instead of heavy third-party community packages.

### Priority 2: Rules for `@expo/ui/swift-ui`

- **CRITICAL**: `@expo/ui/swift-ui` is **strictly iOS-only**.
- **NEVER** import from `@expo/ui/swift-ui` in shared cross-platform files or route files under `src/app/`. Doing so causes fatal Android crashes:
  ```
  WARN Unable to get the view config for VStackView / TabView from module ExpoUI
  ```
- **Platform File Isolation**: If a feature requires specific SwiftUI components or modifiers:
  1. Place the component in `src/components/my-component.ios.tsx`.
  2. Create the Android / Web fallback in `src/components/my-component.android.tsx` (using Jetpack Compose or standard React Native).
  3. Never place `.ios.tsx` or `.android.tsx` files inside `src/app/` (Expo Router does not support platform extensions for route files).

---

## 4. Dual Theme Architecture: Dark & Light Mode

All screens and components must seamlessly support both **Dark Mode** and **Light Mode**.

### A. Theme Tokens ([`src/constants/theme.ts`](file:///e:/expo-ui/glass-ui/src/constants/theme.ts))

Always consume semantic colors from `Colors[colorScheme]`:

| Semantic Token  | Dark Mode                | Light Mode         | Description                |
| :-------------- | :----------------------- | :----------------- | :------------------------- |
| `background`    | `#000000`                | `#F2F2F7`          | System grouped background  |
| `card`          | `#1C1C1E` / `#232326`    | `#FFFFFF`          | Grouped card surface       |
| `text`          | `#FFFFFF`                | `#000000`          | Primary label              |
| `textSecondary` | `#8E8E93`                | `#6C6C70`          | Secondary / footnote label |
| `border`        | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` | Hairline card separator    |
| `accent`        | `#007AFF`                | `#007AFF`          | Primary system blue        |
| `destructive`   | `#FF453A`                | `#FF3B30`          | Destructive action red     |

### B. Dynamic Theme Guidelines

- Use `useColorScheme()` from `react-native` to adapt styles dynamically.
- In `BlurredStatusBar`, pass `tint={isDark ? 'dark' : 'light'}`.
- For icons (`SymbolView`), provide high-contrast tint colors depending on active and theme state.

---

## 5. Senior Engineering & Clean Code Rules

Follow senior engineering practices to keep the codebase maintainable, fast, and scalable:

### 1. Routes Are Routes Only (`src/app/`)

- Every `.tsx` file in `src/app/` is registered as a route by Expo Router.
- **NEVER** place helper components, types, or business logic directly inside `src/app/`.
- Screen bodies must be clean, delegating reusable UI to `src/components/`.

### 2. DRY (Don't Repeat Yourself) & Component Reusability

- Never duplicate UI patterns (e.g. settings rows, switch cards, search bars, avatars).
- When a UI pattern appears more than once, extract it into a focused, reusable component in `src/components/` with TypeScript props.
- Keep components small, composable, and single-responsibility.

### 3. File & Symbol Naming Conventions

- Always use **kebab-case** for file names:
  - `apple-style-kit.tsx`
  - `blurred-status-bar.tsx`
  - `app-tabs.tsx`
- Component names must be **PascalCase**: `AppleSwitch`, `BlurredStatusBar`.
- Custom hooks must be **camelCase** prefixed with `use`: `useThemeColor`.

### 4. Safe Area Insets Discipline

- Always use `useSafeAreaInsets()` from `react-native-safe-area-context`.
- Top padding: `insets.top + (Platform.OS === 'ios' ? 12 : 24)`.
- Bottom padding: `insets.bottom + BottomTabInset + 32` to provide clear clearance above the floating pill tab bar.

### 5. React 19 & Compiler Rules

- **Refs during render**: Never read `.current` during render (e.g., `useRef().current` as an initial value). Use `useState(() => new Animated.Value(...))` to satisfy React 19 compiler rules and avoid linter errors.

---

## 6. Verification Checklist

Before marking any task complete, **always run the following commands** and verify 0 errors:

```bash
# 1. TypeScript Strict Typecheck
npx tsc --noEmit

# 2. Expo ESLint
npx expo lint

# 3. Diagnose dependencies & config
npx expo-doctor
```

> **Zero Warnings Policy**: Ensure there are no unhandled warnings, missing keys, or native view configuration errors on both Android and iOS.
