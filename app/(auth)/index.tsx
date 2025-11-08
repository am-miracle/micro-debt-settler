import { Image } from "expo-image";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import ScreenWrapper from "@/components/screen-wrapper";
import { useRouter } from "expo-router";
import ArrowRightIcon from "@/components/icons/arrow-right";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function HomeScreen() {
  const router = useRouter();
  return (
    <ScreenWrapper>
      <ScrollView className="px-5 py-12 flex flex-col justify-center gap-y-[38px]">
        <Image
          source={require("../../assets/images/home.png")}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
          className="w-full h-[452px] object-cover rounded-[20px]"
        />
        <View className="flex flex-col gap-y-7 items-center">
          <View className="flex flex-col gap-y-1 items-center">
            <Text className="text-black-100 font-semibold text-xl tracking-tight">
              No more awkward IOU's
            </Text>
            <Text className="text-base text-gray-100 tracking-tight font-normal text-center">
              BuddiePay keeps things even automatically without chase.
            </Text>
          </View>
          <View className="flex flex-col gap-y-3 items-center w-full">
            <TouchableOpacity
              onPress={() => router.push("/sign-up")}
              className="bg-primary w-full rounded-full py-4 flex flex-row justify-center gap-x-2"
            >
              <Text className="text-white text-lg font-semibold">
                Get Started
              </Text>
              <ArrowRightIcon width={28} height={28} fill="#00BFA6" />
            </TouchableOpacity>
            <Text className="text-xs font-normal text-gray-100 tracking-tight">Takes less than a few minutes</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
