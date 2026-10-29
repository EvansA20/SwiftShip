import { Feather } from "@expo/vector-icons";
import { type ReactNode } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { brand } from "@/constants/brand";

export function AppPage({
  children,
  contentStyle,
}: {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.page, contentStyle]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function BrandHeader({
  actionLabel = "Staff access",
  onAction,
}: {
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.brandLockup}>
        <View style={styles.brandMark}>
          <Image
            accessibilityLabel="SwiftShip parcel icon"
            source={Platform.OS === "web"
              ? { uri: "/manus-storage/async-images/aFrGMTfBoB8MhkariA1ftV/image-1.webp" }
              : require("../assets/images/icon.png")}
            resizeMode="cover"
            style={styles.brandMarkImage}
          />
        </View>
        <View>
          <Text style={styles.brandName}>SwiftShip</Text>
          <Text style={styles.brandTagline}>Logistics, made clear</Text>
        </View>
      </View>
      {onAction ? (
        <Pressable onPress={onAction} style={styles.headerAction}>
          <Text style={styles.headerActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function SectionTitle({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
    </View>
  );
}

export function Panel({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function ActionButton({
  label,
  onPress,
  icon,
  disabled = false,
  secondary = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  secondary?: boolean;
  loading?: boolean;
}) {
  const backgroundColor = secondary ? brand.paper : brand.navy;
  const foregroundColor = secondary ? brand.navy : "#FFFFFF";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor, opacity: disabled || loading ? 0.5 : pressed ? 0.84 : 1 },
        secondary && styles.secondaryButton,
      ]}
    >
      <Text style={[styles.actionButtonText, { color: foregroundColor }]}>
        {loading ? "Please wait…" : label}
      </Text>
      {icon ? <Feather name={icon} size={17} color={foregroundColor} /> : null}
    </Pressable>
  );
}

export function StatusPill({ label, tone = "orange" }: { label: string; tone?: "orange" | "green" | "gray" | "red" }) {
  const toneStyle = {
    orange: { backgroundColor: "#FFF0E9", color: brand.orange },
    green: { backgroundColor: "#E7F5EF", color: brand.green },
    gray: { backgroundColor: "#EEF1F4", color: brand.muted },
    red: { backgroundColor: "#FCEAE8", color: brand.red },
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.pillText, { color: toneStyle.color }]}>{label}</Text>
    </View>
  );
}

export const uiStyles = StyleSheet.create({
  body: { color: brand.ink, fontSize: 14, lineHeight: 21 },
  muted: { color: brand.muted, fontSize: 13, lineHeight: 19 },
  input: {
    borderColor: brand.line,
    borderRadius: 14,
    borderWidth: 1,
    color: brand.ink,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  fieldLabel: {
    color: brand.ink,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 7,
  },
  fieldGroup: { gap: 7, marginBottom: 14 },
  error: { color: brand.red, fontSize: 13, lineHeight: 19 },
  success: { color: brand.green, fontSize: 13, lineHeight: 19 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: brand.canvas },
  page: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 34, gap: 23 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 48 },
  brandLockup: { alignItems: "center", flexDirection: "row", gap: 10 },
  brandMark: {
    alignItems: "center",
    backgroundColor: brand.navy,
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    overflow: "hidden",
    width: 42,
  },
  brandMarkImage: { height: "100%", width: "100%" },
  brandName: { color: brand.navy, fontSize: 17, fontWeight: "800", letterSpacing: -0.4 },
  brandTagline: { color: brand.muted, fontSize: 10, marginTop: 1 },
  headerAction: { backgroundColor: "#FFFFFF", borderColor: brand.line, borderRadius: 999, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9 },
  headerActionText: { color: brand.navy, fontSize: 12, fontWeight: "700" },
  eyebrow: { color: brand.orange, fontSize: 10, fontWeight: "800", letterSpacing: 1.25, textTransform: "uppercase" },
  sectionTitleWrap: { gap: 4 },
  sectionTitle: { color: brand.navy, fontSize: 21, fontWeight: "800", letterSpacing: -0.55 },
  sectionDetail: { color: brand.muted, fontSize: 13, lineHeight: 19 },
  panel: { backgroundColor: "#FFFFFF", borderColor: brand.line, borderRadius: 20, borderWidth: 1, padding: 17 },
  actionButton: { alignItems: "center", borderRadius: 14, flexDirection: "row", gap: 10, justifyContent: "center", minHeight: 52, paddingHorizontal: 16 },
  actionButtonText: { fontSize: 14, fontWeight: "800" },
  secondaryButton: { borderColor: brand.line, borderWidth: 1 },
  pill: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
});
