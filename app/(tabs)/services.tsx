import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ActionButton, AppPage, BrandHeader, Eyebrow, Panel, SectionTitle } from "@/components/swiftship-ui";
import { brand } from "@/constants/brand";

const offerings = [
  {
    icon: "zap" as const,
    label: "PRIORITY",
    title: "Express delivery",
    description: "For parcels that need a faster hand-off and a little extra attention along the way.",
    bullets: ["Priority handling", "Clear milestone updates", "One tracking ID from start to finish"],
  },
  {
    icon: "package" as const,
    label: "EVERYDAY",
    title: "Standard parcels",
    description: "Straightforward parcel delivery with progress you can check whenever you need it.",
    bullets: ["Reliable parcel handling", "Status and location updates", "Delivery estimate when available"],
  },
  {
    icon: "briefcase" as const,
    label: "FOR TEAMS",
    title: "Business logistics",
    description: "A simpler way for businesses to coordinate repeat shipments and keep recipients informed.",
    bullets: ["Delivery management", "Personnel assignment", "Shipment-by-shipment tracking"],
  },
];

export default function ServicesScreen() {
  const router = useRouter();
  return (
    <AppPage>
      <BrandHeader onAction={() => router.push("/contact")} actionLabel="Get help" />
      <View style={styles.intro}>
        <Eyebrow>DELIVERY SERVICES</Eyebrow>
        <SectionTitle title="The right route for every parcel." detail="Choose a delivery option that fits your shipment." />
      </View>
      {offerings.map((service, index) => (
        <Panel key={service.title} style={[styles.offerCard, index === 0 && styles.featuredCard]}>
          <View style={styles.offerHeader}>
            <View style={[styles.offerIcon, index === 0 && styles.featuredIcon]}>
              <Feather name={service.icon} size={20} color={index === 0 ? brand.orange : brand.navy} />
            </View>
            <Text style={styles.offerLabel}>{service.label}</Text>
          </View>
          <Text style={styles.offerTitle}>{service.title}</Text>
          <Text style={styles.offerDescription}>{service.description}</Text>
          <View style={styles.bulletList}>
            {service.bullets.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <Feather name="check" size={15} color={brand.green} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        </Panel>
      ))}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Already have a Tracking ID?</Text>
        <Text style={styles.ctaCopy}>Open your parcel timeline and see the latest update.</Text>
        <ActionButton label="Track a parcel" icon="arrow-right" onPress={() => router.push("/track")} />
      </View>
      <Pressable onPress={() => router.push("/contact")} style={styles.contactLink}>
        <Text style={styles.contactText}>Need help choosing? Contact our team.</Text>
        <Feather name="arrow-up-right" size={15} color={brand.orange} />
      </Pressable>
    </AppPage>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 7 },
  offerCard: { gap: 11, padding: 18 },
  featuredCard: { borderColor: "#F5CDBD", borderWidth: 1.5 },
  offerHeader: { alignItems: "center", flexDirection: "row", gap: 10 },
  offerIcon: { alignItems: "center", backgroundColor: "#EEF2F5", borderRadius: 13, height: 42, justifyContent: "center", width: 42 },
  featuredIcon: { backgroundColor: "#FFF0E9" },
  offerLabel: { color: brand.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  offerTitle: { color: brand.navy, fontSize: 20, fontWeight: "900", letterSpacing: -0.6 },
  offerDescription: { color: brand.muted, fontSize: 13, lineHeight: 20 },
  bulletList: { borderTopColor: brand.line, borderTopWidth: 1, gap: 10, marginTop: 3, paddingTop: 13 },
  bulletRow: { alignItems: "center", flexDirection: "row", gap: 9 },
  bulletText: { color: brand.ink, flex: 1, fontSize: 12 },
  cta: { backgroundColor: brand.navy, borderRadius: 22, gap: 11, padding: 19 },
  ctaTitle: { color: brand.white, fontSize: 18, fontWeight: "900", letterSpacing: -0.4 },
  ctaCopy: { color: "#C8D4DE", fontSize: 13, lineHeight: 19 },
  contactLink: { alignItems: "center", flexDirection: "row", gap: 6, justifyContent: "center", paddingVertical: 3 },
  contactText: { color: brand.navy, fontSize: 12, fontWeight: "700" },
});
