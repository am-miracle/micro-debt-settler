import { Pressable, Text, View } from "react-native";
import CircleCloseIcon from "../icons/circle-close";
import { Image } from "expo-image";
import CarIcon from "../icons/car";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function WhatsNewCard() {
  return (
    <View className="border-[0.2px] border-success p-[10px] rounded-[20px] bg-green-100 flex flex-col gap-y-3">
      <View className="flex flex-row justify-between">
        <Image
          source={require("../../assets/images/avatar.png")}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
          className="w-10 h-10 object-cover rounded-full"
        />
        <Text className="font-normal font-roboto text-sm tracking-tight text-gray-200">
          Sat, 25 2025
        </Text>
        <CircleCloseIcon />
      </View>
      <View className="flex flex-row gap-x-10 justify-between">
        <View className="flex flex-col gap-y-1">
            <Text className="font-roboto text-lg tracking-tight text-black-150">David owe you $8.00</Text>
            <Text className="font-roboto text-sm text-[#797979] tracking-tight">For cab transport to sport festivals</Text>
        </View>
        <Image
          source={require("../../assets/images/car.png")}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
          className="w-8 h-12"
        />
      </View>
      <Pressable className="shadow-custom border-[0.3px] border-[#00BFA6] rounded-[100px]">
        <Text className="font-roboto p-[10px] w-full text-center h-[44px] flex items-center justify-center text-primary">
          Remind
        </Text>
      </Pressable>
    </View>
  );
}
