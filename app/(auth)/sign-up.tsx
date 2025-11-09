import SignUpForm from "@/components/auth/sign-up-form";
import ScreenWrapper from "@/components/screen-wrapper";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export default function SignUp() {
  return (
    <ScreenWrapper>
      <ScrollView className="px-5 py-12">
        <View className=" flex flex-col justify-center gap-y-10">
          <View className="flex flex-col gap-y-1">
            <Text className="text-black-100 font-semibold text-2xl tracking-tight">Let's get you started 🎉</Text>
            <Text className="text-base leading-[22px] font-normal text-gray-500 tracking-tight">
              Join buddiepay, to track and settle small debts with friends
            </Text>
          </View>
          <SignUpForm />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
