import HomeHeader from "@/components/home/header";
import { ScrollView, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 relative">
      <ScrollView
        className="px-5 py-12"
        contentContainerClassName="pb-24"
      >
        <HomeHeader/>
      </ScrollView>
    </View>
  );
}
