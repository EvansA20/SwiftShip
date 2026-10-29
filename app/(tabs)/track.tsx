import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { ActionButton, AppPage, BrandHeader, Eyebrow, Panel, SectionTitle, StatusPill, uiStyles } from "@/components/swiftship-ui";
import { brand, formatDate, formatDateTime, progressIndex, statusLabel, statusTone } from "@/constants/brand";
import { trpc } from "@/lib/trpc";

const progressSteps = ["Created", "Dispatched", "In transit", "On the way", "Delivered"];

export default function TrackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ trackingId?: string }>();
  const incoming = typeof params.trackingId === "string" ? params.trackingId : "";
  const [localSearch, setLocalSearch] = useState<{ routeId: string; value: string; submitted: string } | null>(null);
  const trackingId = localSearch?.routeId === incoming ? localSearch.value : incoming;
  const submittedId = localSearch?.routeId === incoming ? localSearch.submitted : incoming.trim().toUpperCase();
  const lookup = trpc.logistics.track.useQuery(
    { trackingId: submittedId },
    { enabled: Boolean(submittedId), retry: false },
  );

  const submit = () => {
    const normalized = trackingId.trim().toUpperCase();
    if (normalized) setLocalSearch({ routeId: incoming, value: trackingId, submitted: normalized });
  };
  const shipment = lookup.data;
  const activeStep = shipment ? progressIndex(shipment.status) : -1;

  return (
    <AppPage>
      <BrandHeader onAction={() => router.push("/contact")} actionLabel="Help" />
      <View style={styles.intro}>
        <Eyebrow>PARCEL TRACKING</Eyebrow>
        <SectionTitle title="Follow every step." detail="Enter your Tracking ID to see the latest delivery update." />
      </View>

      <Panel style={styles.searchPanel}>
        <Text style={uiStyles.fieldLabel}>TRACKING ID</Text>
        <TextInput
          value={trackingId}
          onChangeText={(value) => setLocalSearch({ routeId: incoming, value, submitted: "" })}
          placeholder="LOG-2026-000124"
          placeholderTextColor="#98A3AD"
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={submit}
          style={uiStyles.input}
          accessibilityLabel="Tracking ID"
        />
        <ActionButton label="Check tracking" icon="search" onPress={submit} disabled={!trackingId.trim()} loading={lookup.isFetching} />
        <Text style={styles.noAccount}>You can track a parcel without signing in.</Text>
      </Panel>

      {lookup.isFetching && submittedId ? (
        <Panel style={styles.statePanel}>
          <ActivityIndicator color={brand.orange} />
          <Text style={uiStyles.muted}>Finding the latest shipment update…</Text>
        </Panel>
      ) : null}

      {lookup.isError ? (
        <Panel style={styles.statePanel}>
          <View style={styles.stateIcon}><Feather name="wifi-off" size={18} color={brand.red} /></View>
          <Text style={styles.stateTitle}>Tracking is unavailable right now.</Text>
          <Text style={uiStyles.muted}>Please try again in a moment, or contact SwiftShip support.</Text>
        </Panel>
      ) : null}

      {submittedId && lookup.isSuccess && !shipment ? (
        <Panel style={styles.statePanel}>
          <View style={styles.stateIcon}><Feather name="search" size={18} color={brand.orange} /></View>
          <Text style={styles.stateTitle}>We couldn’t find that parcel.</Text>
          <Text style={uiStyles.muted}>Check the Tracking ID and try again. It may not have been registered yet.</Text>
        </Panel>
      ) : null}

      {shipment ? (
        <View style={styles.resultStack}>
          <Panel style={styles.statusCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultIdBlock}>
                <Text style={styles.resultOverline}>TRACKING ID</Text>
                <Text style={styles.resultId}>{shipment.trackingId}</Text>
              </View>
              <StatusPill label={statusLabel(shipment.status)} tone={statusTone(shipment.status)} />
            </View>
            <View style={styles.locationRow}>
              <View style={styles.locationIcon}><Feather name="map-pin" size={16} color={brand.orange} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.metaLabel}>LATEST LOCATION</Text>
                <Text style={styles.locationText}>{shipment.latestLocation || "Location update pending"}</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              {progressSteps.map((step, index) => {
                const reached = shipment.status !== "exception" && index <= activeStep;
                return (
                  <View key={step} style={styles.progressItem}>
                    <View style={[styles.progressDot, reached && styles.progressDotReached, index === activeStep && styles.progressDotCurrent]} />
                    {index < progressSteps.length - 1 ? <View style={[styles.progressLine, index < activeStep && shipment.status !== "exception" && styles.progressLineReached]} /> : null}
                    <Text style={[styles.progressLabel, reached && styles.progressLabelReached]} numberOfLines={1}>{step}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.dateGrid}>
              <View style={styles.dateCell}>
                <Text style={styles.metaLabel}>DISPATCHED</Text>
                <Text style={styles.dateValue}>{formatDate(shipment.dispatchDate)}</Text>
              </View>
              <View style={styles.dateDivider} />
              <View style={styles.dateCell}>
                <Text style={styles.metaLabel}>ESTIMATED DELIVERY</Text>
                <Text style={styles.dateValue}>{formatDate(shipment.estimatedDelivery)}</Text>
              </View>
            </View>
          </Panel>

          <View style={styles.timelineHeading}>
            <SectionTitle title="Delivery timeline" detail={`Last updated ${formatDateTime(shipment.updatedAt) || "recently"}`} />
          </View>
          <Panel style={styles.timelinePanel}>
            {shipment.events.length ? shipment.events.slice().reverse().map((event, index) => (
              <View key={`${event.occurredAt.toISOString?.() ?? String(event.occurredAt)}-${index}`} style={styles.eventRow}>
                <View style={styles.eventRail}>
                  <View style={[styles.eventDot, index === 0 && styles.eventDotLatest]} />
                  {index < shipment.events.length - 1 ? <View style={styles.eventLine} /> : null}
                </View>
                <View style={styles.eventCopy}>
                  <View style={styles.eventTitleRow}>
                    <Text style={styles.eventTitle}>{statusLabel(event.status)}</Text>
                    <Text style={styles.eventTime}>{formatDateTime(event.occurredAt)}</Text>
                  </View>
                  {event.location ? <Text style={styles.eventLocation}>{event.location}</Text> : null}
                  {event.note ? <Text style={styles.eventNote}>{event.note}</Text> : null}
                </View>
              </View>
            )) : <Text style={uiStyles.muted}>No delivery updates have been recorded yet.</Text>}
          </Panel>
        </View>
      ) : null}
    </AppPage>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 7 },
  searchPanel: { gap: 12 },
  noAccount: { color: brand.muted, fontSize: 11, textAlign: "center" },
  statePanel: { alignItems: "center", gap: 9, paddingVertical: 23 },
  stateIcon: { alignItems: "center", backgroundColor: "#FFF0E9", borderRadius: 14, height: 42, justifyContent: "center", width: 42 },
  stateTitle: { color: brand.navy, fontSize: 16, fontWeight: "800", textAlign: "center" },
  resultStack: { gap: 13 },
  statusCard: { gap: 17 },
  resultHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 8 },
  resultIdBlock: { flex: 1, gap: 5 },
  resultOverline: { color: brand.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  resultId: { color: brand.navy, fontSize: 18, fontWeight: "900", letterSpacing: -0.3 },
  locationRow: { alignItems: "center", backgroundColor: brand.canvas, borderRadius: 14, flexDirection: "row", gap: 10, padding: 12 },
  locationIcon: { alignItems: "center", backgroundColor: "#FFF0E9", borderRadius: 11, height: 35, justifyContent: "center", width: 35 },
  metaLabel: { color: brand.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  locationText: { color: brand.navy, fontSize: 14, fontWeight: "800", marginTop: 3 },
  progressTrack: { flexDirection: "row", marginHorizontal: -2, marginTop: 4 },
  progressItem: { alignItems: "center", flex: 1, position: "relative" },
  progressDot: { backgroundColor: "#E0E5E9", borderColor: "#FFFFFF", borderRadius: 99, borderWidth: 2, height: 12, width: 12, zIndex: 1 },
  progressDotReached: { backgroundColor: brand.orange },
  progressDotCurrent: { height: 16, width: 16 },
  progressLine: { backgroundColor: "#E0E5E9", height: 2, left: "50%", position: "absolute", right: "-50%", top: 5 },
  progressLineReached: { backgroundColor: brand.orange },
  progressLabel: { color: brand.muted, fontSize: 8, marginTop: 7, textAlign: "center" },
  progressLabelReached: { color: brand.navy, fontWeight: "700" },
  dateGrid: { alignItems: "center", borderTopColor: brand.line, borderTopWidth: 1, flexDirection: "row", paddingTop: 14 },
  dateCell: { flex: 1, gap: 5 },
  dateDivider: { backgroundColor: brand.line, height: 32, marginHorizontal: 11, width: 1 },
  dateValue: { color: brand.navy, fontSize: 12, fontWeight: "800" },
  timelineHeading: { marginTop: 1 },
  timelinePanel: { paddingBottom: 7, paddingTop: 17 },
  eventRow: { flexDirection: "row", minHeight: 68 },
  eventRail: { alignItems: "center", marginRight: 12, width: 16 },
  eventDot: { backgroundColor: "#DDE3E8", borderRadius: 99, height: 9, marginTop: 4, width: 9, zIndex: 1 },
  eventDotLatest: { backgroundColor: brand.orange, height: 11, width: 11 },
  eventLine: { backgroundColor: brand.line, bottom: -2, position: "absolute", top: 13, width: 1 },
  eventCopy: { flex: 1, gap: 3, paddingBottom: 19 },
  eventTitleRow: { alignItems: "baseline", flexDirection: "row", justifyContent: "space-between", gap: 6 },
  eventTitle: { color: brand.navy, flex: 1, fontSize: 13, fontWeight: "800" },
  eventTime: { color: brand.muted, fontSize: 10 },
  eventLocation: { color: brand.ink, fontSize: 12, fontWeight: "600" },
  eventNote: { color: brand.muted, fontSize: 11, lineHeight: 16 },
});
