import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { ActionButton, AppPage, BrandHeader, Eyebrow, Panel, SectionTitle, StatusPill, uiStyles } from "@/components/swiftship-ui";
import { AdminShipmentCard } from "@/components/admin-shipment-card";
import { brand } from "@/constants/brand";
import type { ShipmentStatus } from "@/drizzle/schema";
import { useAuth } from "@/hooks/use-auth";
import { startOAuthLogin } from "@/constants/oauth";
import { trpc } from "@/lib/trpc";

type CreateForm = {
  recipientName: string;
  destinationCity: string;
  parcelDescription: string;
  initialLocation: string;
  assignedDriver: string;
  estimatedDelivery: string;
};
const emptyForm: CreateForm = {
  recipientName: "",
  destinationCity: "",
  parcelDescription: "",
  initialLocation: "",
  assignedDriver: "",
  estimatedDelivery: "",
};

export default function StaffScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const [createdId, setCreatedId] = useState("");
  const [formError, setFormError] = useState("");
  const utils = trpc.useUtils();
  const dashboard = trpc.logistics.dashboard.useQuery(undefined, {
    enabled: auth.isAuthenticated,
    retry: false,
  });
  const register = trpc.logistics.register.useMutation();
  const update = trpc.logistics.update.useMutation();

  const beginLogin = async () => {
    setLoginError("");
    setLoginLoading(true);
    try {
      await startOAuthLogin();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Sign-in could not be started.");
    } finally {
      setLoginLoading(false);
    }
  };

  const submitShipment = async () => {
    setFormError("");
    setCreatedId("");
    try {
      const result = await register.mutateAsync({
        recipientName: form.recipientName.trim(),
        destinationCity: form.destinationCity.trim(),
        parcelDescription: form.parcelDescription.trim(),
        initialLocation: form.initialLocation.trim() || undefined,
        assignedDriver: form.assignedDriver.trim() || undefined,
        estimatedDelivery: form.estimatedDelivery.trim() || undefined,
      });
      setCreatedId(result.trackingId);
      setForm(emptyForm);
      void utils.logistics.dashboard.invalidate();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Shipment could not be registered.");
    }
  };

  const saveUpdate = async (input: {
    shipmentId: number;
    status: ShipmentStatus;
    location: string;
    note?: string;
    assignedDriver?: string;
  }) => {
    await update.mutateAsync(input);
    void utils.logistics.dashboard.invalidate();
  };

  const handleLogout = async () => {
    await auth.logout();
    void utils.logistics.dashboard.invalidate();
  };

  return (
    <AppPage contentStyle={styles.page}>
      <BrandHeader onAction={() => router.replace("/(tabs)")} actionLabel="Customer app" />
      <View style={styles.intro}>
        <Eyebrow>SWIFTSHIP OPERATIONS</Eyebrow>
        <SectionTitle title="Delivery control." detail="Register parcels, assign personnel, and keep each update current." />
      </View>

      {auth.loading ? (
        <Panel style={styles.centerState}><ActivityIndicator color={brand.orange} /><Text style={uiStyles.muted}>Checking your sign-in…</Text></Panel>
      ) : !auth.isAuthenticated ? (
        <Panel style={styles.loginPanel}>
          <View style={styles.loginIcon}><Feather name="lock" size={21} color={brand.orange} /></View>
          <Text style={styles.loginTitle}>Staff sign-in required</Text>
          <Text style={styles.loginCopy}>Shipment records and delivery controls are available only to authorized SwiftShip staff.</Text>
          <ActionButton label="Sign in with Manus" icon="arrow-right" onPress={beginLogin} loading={loginLoading} />
          {loginError ? <Text style={uiStyles.error}>{loginError}</Text> : null}
          <Text style={styles.secureNote}>Secure authentication · Admin role checked by the server</Text>
        </Panel>
      ) : dashboard.error?.data?.code === "FORBIDDEN" ? (
        <Panel style={styles.loginPanel}>
          <View style={[styles.loginIcon, styles.noAccessIcon]}><Feather name="shield" size={21} color={brand.red} /></View>
          <Text style={styles.loginTitle}>Admin access is not enabled for this account.</Text>
          <Text style={styles.loginCopy}>You are signed in as {auth.user?.email || auth.user?.name || "a SwiftShip user"}. Ask the project owner to run the private `pnpm admin:grant` command after your first sign-in.</Text>
          <ActionButton label="Sign out" icon="log-out" onPress={handleLogout} secondary />
        </Panel>
      ) : dashboard.isLoading || dashboard.isFetching ? (
        <Panel style={styles.centerState}><ActivityIndicator color={brand.orange} /><Text style={uiStyles.muted}>Loading shipment operations…</Text></Panel>
      ) : dashboard.isError ? (
        <Panel style={styles.centerState}>
          <Text style={styles.loginTitle}>Operations are unavailable.</Text>
          <Text style={uiStyles.muted}>{dashboard.error.message}</Text>
          <ActionButton label="Try again" icon="refresh-cw" onPress={() => void dashboard.refetch()} secondary />
        </Panel>
      ) : dashboard.data ? (
        <>
          <View style={styles.dashboardHeader}>
            <View>
              <Text style={styles.welcome}>Operations overview</Text>
              <Text style={styles.welcomeSub}>Signed in as {auth.user?.name || auth.user?.email || "SwiftShip admin"}</Text>
            </View>
            <ActionButton label="Sign out" icon="log-out" onPress={handleLogout} secondary />
          </View>

          <View style={styles.metricsRow}>
            <Metric label="RECENT" value={String(dashboard.data.length)} />
            <Metric label="IN MOTION" value={String(dashboard.data.filter((item) => ["dispatched", "in_transit", "out_for_delivery"].includes(item.status)).length)} accent />
            <Metric label="DELIVERED" value={String(dashboard.data.filter((item) => item.status === "delivered").length)} />
          </View>
          <Text style={styles.metricsFootnote}>Counts reflect the most recently updated shipments shown below.</Text>

          <RegisterShipment
            form={form}
            setForm={setForm}
            onSubmit={submitShipment}
            isPending={register.isPending}
            error={formError}
            createdId={createdId}
          />

          <View style={styles.listHeading}>
            <SectionTitle title="Manage deliveries" detail="Recent shipments, status, and assigned personnel." />
            <StatusPill label={`${dashboard.data.length} shown`} tone="gray" />
          </View>

          {dashboard.data.length ? (
            <View style={styles.shipmentList}>
              {dashboard.data.map((shipment) => (
                <AdminShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onSave={saveUpdate}
                  isSaving={update.isPending}
                  updateError={update.error?.message}
                />
              ))}
            </View>
          ) : (
            <Panel style={styles.centerState}>
              <View style={styles.loginIcon}><Feather name="package" size={21} color={brand.orange} /></View>
              <Text style={styles.loginTitle}>No parcels registered yet.</Text>
              <Text style={uiStyles.muted}>Create the first shipment above. Its Tracking ID will be generated automatically.</Text>
            </Panel>
          )}
        </>
      ) : null}
    </AppPage>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <Panel style={styles.metricCard}>
      <Text style={[styles.metricValue, accent && { color: brand.orange }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Panel>
  );
}

function RegisterShipment({
  form,
  setForm,
  onSubmit,
  isPending,
  error,
  createdId,
}: {
  form: CreateForm;
  setForm: (next: CreateForm) => void;
  onSubmit: () => void;
  isPending: boolean;
  error: string;
  createdId: string;
}) {
  const field = (key: keyof CreateForm, value: string) => setForm({ ...form, [key]: value });
  const [shareState, setShareState] = useState<{ trackingId: string; message: string } | null>(null);
  const shareMessage = shareState?.trackingId === createdId ? shareState.message : "";
  const shareTrackingId = async () => {
    const message = `Your SwiftShip parcel Tracking ID is ${createdId}`;
    try {
      if (Platform.OS === "web" && typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ text: message });
      } else {
        await Share.share({ message });
      }
      setShareState({ trackingId: createdId, message: "Tracking ID shared." });
    } catch {
      setShareState({ trackingId: createdId, message: "Select and copy the Tracking ID above to share it manually." });
    }
  };
  return (
    <Panel style={styles.registerPanel}>
      <View style={styles.formHeading}>
        <View style={styles.formIcon}><Feather name="plus" size={19} color={brand.orange} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.formTitle}>Register a shipment</Text>
          <Text style={styles.formHint}>Tracking ID is generated automatically.</Text>
        </View>
      </View>
      <Field label="RECIPIENT NAME">
        <TextInput value={form.recipientName} onChangeText={(value) => field("recipientName", value)} placeholder="Recipient name" style={uiStyles.input} />
      </Field>
      <Field label="DESTINATION CITY">
        <TextInput value={form.destinationCity} onChangeText={(value) => field("destinationCity", value)} placeholder="City or delivery area" style={uiStyles.input} />
      </Field>
      <Field label="PARCEL DESCRIPTION">
        <TextInput value={form.parcelDescription} onChangeText={(value) => field("parcelDescription", value)} placeholder="For staff reference" style={uiStyles.input} />
      </Field>
      <Field label="STARTING LOCATION · OPTIONAL">
        <TextInput value={form.initialLocation} onChangeText={(value) => field("initialLocation", value)} placeholder="Origin facility or city" style={uiStyles.input} />
      </Field>
      <Field label="DELIVERY PERSONNEL · OPTIONAL">
        <TextInput value={form.assignedDriver} onChangeText={(value) => field("assignedDriver", value)} placeholder="Assign a delivery person" style={uiStyles.input} />
      </Field>
      <Field label="ESTIMATED DELIVERY · OPTIONAL">
        <TextInput value={form.estimatedDelivery} onChangeText={(value) => field("estimatedDelivery", value)} placeholder="YYYY-MM-DD" style={uiStyles.input} />
      </Field>
      <Text style={styles.privateNote}>Recipient name and parcel description are staff-only. Public tracking never exposes them.</Text>
      {error ? <Text style={uiStyles.error}>{error}</Text> : null}
      {createdId ? (
        <View style={styles.createdNotice}>
          <Feather name="check-circle" size={18} color={brand.green} />
          <View style={{ flex: 1 }}>
            <Text style={styles.createdTitle}>Shipment registered</Text>
            <Text selectable style={styles.createdTrackingId}>{createdId}</Text>
            <Text style={styles.createdHint}>Share this Tracking ID with the customer.</Text>
            <Pressable accessibilityRole="button" onPress={() => void shareTrackingId()} style={styles.shareButton}>
              <Feather name="share-2" size={14} color={brand.green} />
              <Text style={styles.shareButtonText}>Share Tracking ID</Text>
            </Pressable>
            {shareMessage ? <Text style={styles.shareHint}>{shareMessage}</Text> : null}
          </View>
        </View>
      ) : null}
      <ActionButton label="Create shipment" icon="arrow-right" onPress={onSubmit} loading={isPending} disabled={!form.recipientName.trim() || !form.destinationCity.trim() || !form.parcelDescription.trim()} />
    </Panel>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={uiStyles.fieldGroup}><Text style={uiStyles.fieldLabel}>{label}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  page: { gap: 18 },
  intro: { gap: 7 },
  centerState: { alignItems: "center", gap: 10, paddingVertical: 25 },
  loginPanel: { gap: 12, padding: 20 },
  loginIcon: { alignItems: "center", backgroundColor: "#FFF0E9", borderRadius: 15, height: 48, justifyContent: "center", width: 48 },
  noAccessIcon: { backgroundColor: "#FCEAE8" },
  loginTitle: { color: brand.navy, fontSize: 17, fontWeight: "900", letterSpacing: -0.35 },
  loginCopy: { color: brand.muted, fontSize: 13, lineHeight: 20 },
  secureNote: { color: brand.muted, fontSize: 10, textAlign: "center" },
  dashboardHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 8 },
  welcome: { color: brand.navy, fontSize: 18, fontWeight: "900", letterSpacing: -0.4 },
  welcomeSub: { color: brand.muted, fontSize: 11, marginTop: 3 },
  metricsRow: { flexDirection: "row", gap: 8 },
  metricsFootnote: { color: brand.muted, fontSize: 9, marginTop: -13 },
  metricCard: { flex: 1, gap: 3, paddingHorizontal: 10, paddingVertical: 12 },
  metricValue: { color: brand.navy, fontSize: 22, fontWeight: "900" },
  metricLabel: { color: brand.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.6 },
  registerPanel: { gap: 13 },
  formHeading: { alignItems: "center", flexDirection: "row", gap: 11, marginBottom: 2 },
  formIcon: { alignItems: "center", backgroundColor: "#FFF0E9", borderRadius: 13, height: 42, justifyContent: "center", width: 42 },
  formTitle: { color: brand.navy, fontSize: 16, fontWeight: "900" },
  formHint: { color: brand.muted, fontSize: 11, marginTop: 2 },
  privateNote: { color: brand.muted, fontSize: 10, lineHeight: 15 },
  createdNotice: { alignItems: "flex-start", backgroundColor: "#EAF6F0", borderRadius: 13, flexDirection: "row", gap: 10, padding: 12 },
  createdTitle: { color: brand.green, fontSize: 12, fontWeight: "800" },
  createdTrackingId: { color: brand.navy, fontSize: 16, fontWeight: "900", marginTop: 2 },
  createdHint: { color: brand.muted, fontSize: 10, marginTop: 3 },
  shareButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderColor: "#C6E3D4", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 6, marginTop: 9, paddingHorizontal: 10, paddingVertical: 8 },
  shareButtonText: { color: brand.green, fontSize: 10, fontWeight: "800" },
  shareHint: { color: brand.muted, fontSize: 9, lineHeight: 14, marginTop: 5 },
  listHeading: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between", gap: 8 },
  shipmentList: { gap: 11 },
});
