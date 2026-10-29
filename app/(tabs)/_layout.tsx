import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { Feather } from "@expo/vector-icons";
import { Platform } from "react-native";
import { brand } from "@/constants/brand";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: brand.orange,
        tabBarInactiveTintColor: brand.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: "#FFFFFF",
          borderTopColor: brand.line,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Feather size={19} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="track"
        options={{ title: "Track", tabBarIcon: ({ color }) => <Feather size={19} name="search" color={color} /> }}
      />
      <Tabs.Screen
        name="services"
        options={{ title: "Services", tabBarIcon: ({ color }) => <Feather size={19} name="truck" color={color} /> }}
      />
      <Tabs.Screen
        name="contact"
        options={{ title: "Help", tabBarIcon: ({ color }) => <Feather size={19} name="message-circle" color={color} /> }}
      />
    </Tabs>
  );
}
