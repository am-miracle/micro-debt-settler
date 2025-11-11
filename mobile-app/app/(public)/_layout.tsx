// app/_layout.tsx
import { Stack } from "expo-router";
import { View } from "react-native";
import FloatingNav from "@/components/ui/floating-nav";

export default function RootLayout() {
  return (
    <View className="flex-1">
      <Stack screenOptions={{ headerShown: false }} />

      <FloatingNav />
    </View>
  );
}
