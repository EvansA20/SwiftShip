import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ActionButton, Panel, StatusPill, uiStyles } from "@/components/swiftship-ui";
import { brand, formatDate, statusLabel, statusOptions, statusTone } from "@/constants/brand";
import type { Shipment, ShipmentStatus } from "@/drizzle/schema";

type UpdateInput = {
  shipmentId: number;
  status: ShipmentStatus;
  location: string;
  note?: string;
  assignedDriver?: string;
};

export function AdminShipmentCard({
  shipment,
  onSave,
  isSaving,
  updateError,
}: {
  shipment: Shipment;
  onSave: (input: UpdateInput) => Promise<void>;
  isSaving: boolean;
  updateError?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<ShipmentStatus>(shipment.status);
  const [location, setLocation] = useState(shipment.latestLocation ?? "");
  const [driver, setDriver] = useState(shipment.assignedDriver ?? "");
  const [note, setNote] = useState("");
  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    setSaveError("");
    try {
      await onSave({
        shipmentId: shipment.id,
        status,
        location: location.trim(),
        note: note.trim() || undefined,
        assignedDriver: driver.trim(),
      });
      setNote("");
      setExpanded(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Update could not be saved.");
    }
  };

  return (
    <Panel style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.idBlock}>
          <Text style={styles.overline}>TRACKING ID</Text>
          <Text selectable style={styles.trackingId}>{shipment.trackingId}</Text>
        </View>
        <StatusPill label={statusLabel(shipment.status)} tone={statusTone(shipment.status)} />
      </View>
      <View style={styles.detailGrid}>
        <Info label="RECIPIENT" value={shipment.recipientName} />
        <Info label="DESTINATION" value={shipment.destinationCity} />
        <Info label="PERSONNEL" value={shipment.assignedDriver || "Not assigned"} />
        <Info label="EST. DELIVERY" value={formatDate(shipment.estimatedDelivery)} />
      </View>
      <Text numberOfLines={2} style={styles.description}>{shipment.parcelDescription}</Text>
      <Pressable onPress={() => setExpanded((value) => !value)} style={styles.expandButton}>
        <Text style={styles.expandText}>{expanded ? "Close update" : "Update delivery"}</Text>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={brand.orange} />
      </Pressable>
      {expanded ? (
        <View style={styles.editor}>
          <Text style={uiStyles.fieldLabel}>PARCEL STATUS</Text>
          <View style={styles.statusChoices}>
            {statusOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setStatus(option)}
                style={[styles.statusChoice, status === option && styles.statusChoiceActive]}
              >
                <Text style={[styles.statusChoiceText, status === option && styles.statusChoiceTextActive]}>{statusLabel(option)}</Text>
              </Pressable>
            ))}
          </View>
          <Field label="LATEST LOCATION">
            <TextInput value={location} onChangeText={setLocation} placeholder="Current city or facility" style={uiStyles.input} />
          </Field>
          <Field label="DELIVERY PERSONNEL">
            <TextInput value={driver} onChangeText={setDriver} placeholder="Assign or change delivery person" style={uiStyles.input} />
          </Field>
          <Field label="CUSTOMER-FACING UPDATE · OPTIONAL">
            <TextInput value={note} onChangeText={setNote} placeholder="A short update customers can see" style={[uiStyles.input, styles.noteInput]} multiline />
          </Field>
          <Text style={styles.publicHint}>This note will appear in the customer’s tracking timeline. Keep it brief and do not include private details.</Text>
          {saveError || updateError ? <Text style={uiStyles.error}>{saveError || updateError}</Text> : null}
          <ActionButton label="Save delivery update" icon="check" onPress={handleSave} loading={isSaving} disabled={location.trim().length < 2} />
        </View>
      ) : null}
    </Panel>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <View style={styles.infoCell}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue} numberOfLines={2}>{value}</Text></View>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={uiStyles.fieldGroup}><Text style={uiStyles.fieldLabel}>{label}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  card: { gap: 13, padding: 15 },
  topRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 8 },
  idBlock: { flex: 1, gap: 4 },
  overline: { color: brand.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  trackingId: { color: brand.navy, fontSize: 15, fontWeight: "900" },
  detailGrid: { backgroundColor: brand.canvas, borderRadius: 13, flexDirection: "row", flexWrap: "wrap", gap: 10, padding: 11 },
  infoCell: { gap: 3, minWidth: "45%", flexGrow: 1 },
  infoLabel: { color: brand.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.7 },
  infoValue: { color: brand.ink, fontSize: 11, fontWeight: "700" },
  description: { color: brand.muted, fontSize: 11, lineHeight: 16 },
  expandButton: { alignItems: "center", borderTopColor: brand.line, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingTop: 12 },
  expandText: { color: brand.orange, fontSize: 12, fontWeight: "800" },
  editor: { borderTopColor: brand.line, borderTopWidth: 1, gap: 12, paddingTop: 13 },
  statusChoices: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 3 },
  statusChoice: { backgroundColor: brand.canvas, borderColor: brand.line, borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  statusChoiceActive: { backgroundColor: brand.navy, borderColor: brand.navy },
  statusChoiceText: { color: brand.muted, fontSize: 10, fontWeight: "700" },
  statusChoiceTextActive: { color: "#FFFFFF" },
  noteInput: { minHeight: 76, textAlignVertical: "top" },
  publicHint: { color: brand.muted, fontSize: 10, lineHeight: 15, marginTop: -5 },
});
