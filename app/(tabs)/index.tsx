import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ActionButton, AppPage, BrandHeader, Eyebrow, Panel, SectionTitle } from "@/components/swiftship-ui";
import { brand } from "@/constants/brand";

/**
 * Home Screen - NativeWind Example
 *
 * This template uses NativeWind (Tailwind CSS for React Native).
 * You can use familiar Tailwind classes directly in className props.
 *
 * Key patterns:
 * - Use `className` instead of `style` for most styling
 * - Theme colors: use tokens directly (bg-background, text-foreground, bg-primary, etc.); no dark: prefix needed
 * - Responsive: standard Tailwind breakpoints work on web
 * - Custom colors defined in tailwind.config.js
 */
export default function HomeScreen() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const trackParcel = () => {
    const id = trackingId.trim().toUpperCase();
    if (!id) return;
    router.push({ pathname: "/track", params: { trackingId: id } });
  };

  return (
    <AppPage>
      <BrandHeader onAction={() => router.push("/staff")} />
      <View style={styles.hero}>
        <View style={styles.heroTopline}>
          <View style={styles.heroDot} />
          <Text style={styles.heroEyebrow}>YOUR PARCEL, IN MOTION</Text>
        </View>
        <Text style={styles.heroTitle}>Good things are on their way.</Text>
        <Text style={styles.heroCopy}>One tracking ID brings every delivery update into view.</Text>
        <View style={styles.searchLabelRow}>
          <Text style={styles.searchLabel}>TRACK A PARCEL</Text>
          <Feather name="arrow-down-right" color="#FF9A70" size={18} />
        </View>
        <TextInput
          value={trackingId}
          onChangeText={setTrackingId}
          placeholder="LOG-2026-000124"
          placeholderTextColor="#8B9AA8"
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={trackParcel}
          style={styles.trackingInput}
          accessibilityLabel="Tracking ID"
        />
        <ActionButton label="Find my parcel" icon="arrow-right" onPress={trackParcel} disabled={!trackingId.trim()} />
        <Text style={styles.privacyLine}>No customer account needed.</Text>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Eyebrow>HOW WE HELP</Eyebrow>
          <SectionTitle title="Delivery, with clarity." detail="Choose a service that fits the journey." />
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push("/services")} style={styles.textLink}>
          <Text style={styles.textLinkText}>All services</Text>
          <Feather name="arrow-up-right" size={15} color={brand.orange} />
        </Pressable>
      </View>

      <View style={styles.serviceList}>
        {[
          { icon: "zap" as const, title: "Express delivery", detail: "A priority option for time-sensitive parcels." },
          { icon: "package" as const, title: "Everyday parcels", detail: "Clear progress updates from dispatch to delivery." },
          { icon: "briefcase" as const, title: "Business logistics", detail: "Shipment coordination for teams and repeat senders." },
        ].map((service, index) => (
          <Pressable
            accessibilityRole="button"
            key={service.title}
            onPress={() => router.push("/services")}
            style={({ pressed }) => [styles.serviceRow, pressed && { opacity: 0.82 }]}
          >
            <View style={[styles.serviceIcon, index === 0 && styles.serviceIconAccent]}>
              <Feather name={service.icon} size={19} color={index === 0 ? brand.orange : brand.navy} />
            </View>
            <View style={styles.serviceText}>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDetail}>{service.detail}</Text>
            </View>
            <Feather name="chevron-right" size={17} color={brand.muted} />
          </Pressable>
        ))}
      </View>

      <Panel style={styles.helpPanel}>
        <View style={styles.helpIcon}><Feather name="message-circle" size={19} color={brand.orange} /></View>
        <View style={styles.helpText}>
          <Text style={styles.helpTitle}>Need a hand?</Text>
          <Text style={styles.helpCopy}>Our contact details and support options are in one place.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push("/contact")} hitSlop={8}>
          <Feather name="arrow-up-right" size={19} color={brand.navy} />
        </Pressable>
      </Panel>
    </AppPage>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: brand.navy, borderRadius: 27, gap: 15, overflow: "hidden", padding: 22 },
  heroTopline: { alignItems: "center", flexDirection: "row", gap: 8 },
  heroDot: { backgroundColor: brand.orange, borderRadius: 99, height: 7, width: 7 },
  heroEyebrow: { color: "#C7D4DE", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  heroTitle: { color: brand.white, fontSize: 31, fontWeight: "800", letterSpacing: -1.05, lineHeight: 36, maxWidth: 310 },
  heroCopy: { color: "#C3D0DB", fontSize: 14, lineHeight: 21, maxWidth: 310 },
  searchLabelRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: -6, marginTop: 2 },
  searchLabel: { color: "#D9E1E8", fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  trackingInput: { backgroundColor: brand.white, borderRadius: 14, color: brand.ink, fontSize: 15, fontWeight: "700", minHeight: 52, paddingHorizontal: 15 },
  privacyLine: { color: "#B9C6D0", fontSize: 11, textAlign: "center" },
  sectionHeader: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between", gap: 8 },
  textLink: { alignItems: "center", flexDirection: "row", gap: 4, marginBottom: 3 },
  textLinkText: { color: brand.orange, fontSize: 12, fontWeight: "800" },
  serviceList: { gap: 2, marginTop: -11 },
  serviceRow: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: brand.line, borderRadius: 17, borderWidth: 1, flexDirection: "row", gap: 12, marginBottom: 8, paddingHorizontal: 13, paddingVertical: 14 },
  serviceIcon: { alignItems: "center", backgroundColor: "#EEF2F5", borderRadius: 13, height: 42, justifyContent: "center", width: 42 },
  serviceIconAccent: { backgroundColor: "#FFF0E9" },
  serviceText: { flex: 1, gap: 3 },
  serviceTitle: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  serviceDetail: { color: brand.muted, fontSize: 11, lineHeight: 16 },
  helpPanel: { alignItems: "center", flexDirection: "row", gap: 12, padding: 15 },
  helpIcon: { alignItems: "center", backgroundColor: "#FFF0E9", borderRadius: 13, height: 42, justifyContent: "center", width: 42 },
  helpText: { flex: 1, gap: 3 },
  helpTitle: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  helpCopy: { color: brand.muted, fontSize: 11, lineHeight: 16 },
});
