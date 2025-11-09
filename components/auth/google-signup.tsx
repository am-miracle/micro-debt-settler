import { Text, TouchableOpacity, View } from "react-native";
import GoogleIcon from "../icons/google-icon";

export default function GoogleSignUp() {
  return (
    <View>
      <TouchableOpacity className="rounded-xl border-[0.5px] border-gray-200 py-3 flex flex-row justify-center items-center gap-x-2">
        <GoogleIcon />
        <Text className="text-black-150 text-lg font-normal tracking-normal">Sign up with Google</Text>
      </TouchableOpacity>
    </View>
  );
}
