import { Image } from "expo-image";
import { Text, View } from "react-native";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function UpcomingPaymentsCard() {
  return (
    <View className="flex flex-row items-center gap-x-4 p-[10px] bg-[#E6F3F1] rounded-xl">
      <Image
        source={require("../../assets/images/car.png")}
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={1000}
        className="w-8 h-12"
      />
      <View>
        <Text className="font-roboto text-lg font-normal tracking-tight text-black-150">Dinner split with Emma</Text>
        <Text className="font-roboto text-sm font-normal tracking-tight text-gray-100">Auto settles in 1 day</Text>
      </View>
    </View>
  );
}
