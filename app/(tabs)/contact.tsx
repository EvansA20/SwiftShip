import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { ActionButton, AppPage, BrandHeader, Eyebrow, Panel, SectionTitle, uiStyles } from "@/components/swiftship-ui";
import { brand } from "@/constants/brand";

const DEMO_EMAIL = "help@swiftship.example";
const DEMO_PHONE = "+1 (202) 555-0144";

export default function ContactScreen() {
  const router = useRouter();
  const [openError, setOpenError] = useState("");
  const openContact = async (url: string) => {
    setOpenError("");
    try {
      await Linking.openURL(url);
    } catch {
      setOpenError("No mail or phone app is available on this device.");
    }
  };

  return (
    <AppPage>
      <BrandHeader onAction={() => router.push("/staff")} actionLabel="Staff access" />
      <View style={styles.intro}>
        <Eyebrow>WE’RE HERE TO HELP</Eyebrow>
        <SectionTitle title="Let’s get your delivery sorted." detail="For a parcel update, have your Tracking ID handy when you contact the team." />
      </View>

      <View style={styles.demoNotice}>
        <Feather name="alert-circle" size={17} color="#9B5818" />
        <Text style={styles.demoNoticeText}>Demo contact details — replace these with your real support channels before launch.</Text>
      </View>

      <Panel style={styles.contactCard}>
        <View style={styles.contactIcon}><Feather name="mail" size={19} color={brand.orange} /></View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactLabel}>EMAIL SUPPORT</Text>
          <Text style={styles.contactValue}>{DEMO_EMAIL}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => openContact(`mailto:${DEMO_EMAIL}`)} style={styles.iconButton}>
          <Feather name="arrow-up-right" size={18} color={brand.navy} />
        </Pressable>
      </Panel>

      <Panel style={styles.contactCard}>
        <View style={styles.contactIcon}><Feather name="phone" size={19} color={brand.orange} /></View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactLabel}>CALL SUPPORT</Text>
          <Text style={styles.contactValue}>{DEMO_PHONE}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => openContact("tel:+12025550144")} style={styles.iconButton}>
          <Feather name="arrow-up-right" size={18} color={brand.navy} />
        </Pressable>
      </Panel>
      {openError ? <Text style={uiStyles.error}>{openError}</Text> : null}

      <Panel style={styles.faqPanel}>
        <Text style={styles.faqTitle}>Before you reach out</Text>
        <View style={styles.tipRow}>
          <View style={styles.tipNumber}><Text style={styles.tipNumberText}>1</Text></View>
          <Text style={styles.tipText}>Double-check the letters and numbers in your Tracking ID.</Text>
        </View>
        <View style={styles.tipRow}>
          <View style={styles.tipNumber}><Text style={styles.tipNumberText}>2</Text></View>
          <Text style={styles.tipText}>Share the latest status and location shown in the app.</Text>
        </View>
        <View style={styles.tipRow}>
          <View style={styles.tipNumber}><Text style={styles.tipNumberText}>3</Text></View>
          <Text style={styles.tipText}>Ask the sender for the ID if you have not received it yet.</Text>
        </View>
      </Panel>

      <ActionButton label="Track a parcel" icon="search" onPress={() => router.push("/track")} secondary />
    </AppPage>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 7 },
  demoNotice: { alignItems: "flex-start", backgroundColor: "#FFF5E8", borderColor: "#F2D9B8", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 9, padding: 12 },
  demoNoticeText: { color: "#80511C", flex: 1, fontSize: 11, fontWeight: "700", lineHeight: 17 },
  contactCard: { alignItems: "center", flexDirection: "row", gap: 12, padding: 14 },
  contactIcon: { alignItems: "center", backgroundColor: "#FFF0E9", borderRadius: 13, height: 42, justifyContent: "center", width: 42 },
  contactDetails: { flex: 1, gap: 4 },
  contactLabel: { color: brand.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.9 },
  contactValue: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  iconButton: { alignItems: "center", backgroundColor: brand.canvas, borderRadius: 11, height: 36, justifyContent: "center", width: 36 },
  faqPanel: { gap: 15 },
  faqTitle: { color: brand.navy, fontSize: 17, fontWeight: "900", letterSpacing: -0.3 },
  tipRow: { alignItems: "flex-start", flexDirection: "row", gap: 10 },
  tipNumber: { alignItems: "center", backgroundColor: "#EEF2F5", borderRadius: 99, height: 22, justifyContent: "center", width: 22 },
  tipNumberText: { color: brand.navy, fontSize: 10, fontWeight: "800" },
  tipText: { color: brand.muted, flex: 1, fontSize: 12, lineHeight: 18 },
});
