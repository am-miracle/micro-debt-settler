import ScreenWrapper from "@/components/screen-wrapper";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function LandScreen() {
const router = useRouter();
  useEffect(() => {
    router.replace("/onboarding");
  }, []);
return(
  <ScreenWrapper>
    <View className="h-screen flex flex-row items-center justify-center">
      {/* Placeholder, will be changed later! */}
      Micro Debt Settler
    </View>
  </ScreenWrapper>
)
}
