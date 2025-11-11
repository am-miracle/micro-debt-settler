import { Text, View } from "react-native";
import WhatsNewCard from "./whats-new-card";

export default function WhatsNew() {
  return (
    <View className="py-14">
      <Text className="font-roboto-medium text-lg font-medium tracking-tight text-black-100">
        Look what's new!
      </Text>
      <View className="py-2 flex flex-col gap-y-4">
      <WhatsNewCard />
      </View>
    </View>
  );
}
