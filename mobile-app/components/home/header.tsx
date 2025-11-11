import { Pressable, Text, View } from "react-native";
import CalenderIcon from "../icons/calender";
import { Image } from "expo-image";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function HomeHeader() {
  return (
    <View className="flex flex-row items-center justify-between">
      <View className="flex flex-row items-center gap-x-2">
        <Image
          source={require("../../assets/images/avatar.png")}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
          className="w-[49px] h-[49px] object-cover rounded-full"
        />
        <View className="flex flex-col gap-y-1">
          <Text className="font-roboto-medium text-lg font-medium tracking-tight text-black-180">
            Hey, Ayo 👋🏻
          </Text>
          <Text className="text-base leading-[22px] font-normal font-roboto text-gray-250">
            Here's what is pending today.
          </Text>
        </View>
      </View>
      <Pressable>
        <CalenderIcon/>
      </Pressable>
    </View>
  );
}
