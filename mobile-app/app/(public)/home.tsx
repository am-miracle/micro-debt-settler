import ScreenWrapper from "@/components/screen-wrapper";
import FloatingNav from "@/components/ui/floating-nav";
import { ScrollView, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 relative">
      <ScrollView
        className="px-5 py-12"
        contentContainerClassName="pb-24"
      >
        <View className="h-screen">1</View>
      </ScrollView>

      <FloatingNav />
    </View>
  );
}
