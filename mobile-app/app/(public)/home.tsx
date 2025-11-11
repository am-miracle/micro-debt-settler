import HomeHeader from "@/components/home/header";
import UpcomingPayments from "@/components/upcoming-payments/upcoming-payments";
import WhatsNew from "@/components/whats-new/whats-new";
import { ScrollView, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 relative">
      <ScrollView
        className="px-5 py-12"
        contentContainerClassName="pb-24"
      >
        <HomeHeader/>
        <WhatsNew/>
        <UpcomingPayments/>
      </ScrollView>
    </View>
  );
}
