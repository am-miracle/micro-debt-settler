import React from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { View, TextInput, Text, TouchableOpacity, Pressable } from "react-native";
import GoogleSignUp from "./google-signup";
import { useRouter } from "expo-router";

type FormData = {
  name: string;
  email: string;
  phone?: number;
  password: string;
};

export default function RHFForm() {
  const { control, handleSubmit, watch } = useForm<FormData>();
  const router = useRouter();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log("Form Data:", data);
  };

  // Watch required fields
  const name = watch("name");
  const email = watch("email");
  const password = watch("password");

  // Button enabled only if all required fields are filled
  const isFormValid = name && email && password;

  return (
    <View className="flex flex-col gap-y-8">
      <View className="flex flex-col gap-y-4">
        {/* Name Field */}
        <View className="flex flex-col gap-y-[6px]">
          <Text className="text-black-200 text-base leading-[22px] font-normal">
            Full Name
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter your name"
                value={value}
                onChangeText={onChange}
                className="border-[0.8px] border-gray-200 rounded-xl px-[12px] py-2.5 text-sm font-normal text-gray-150"
              />
            )}
          />
        </View>

        {/* Email Field */}
        <View className="flex flex-col gap-y-[6px]">
          <Text className="text-black-200 text-base leading-[22px] font-normal">
            Email
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter your email"
                value={value}
                onChangeText={onChange}
                className="border-[0.8px] border-gray-200 rounded-xl px-[12px] py-2.5 text-sm font-normal text-gray-150"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
        </View>

        {/* Phone Number Field */}
        <View className="flex flex-col gap-y-[6px]">
          <Text className="text-black-200 text-base leading-[22px] font-normal">
            Phone number <Text className="text-gray-150">(optional)</Text>
          </Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter phone number"
                value={value?.toString()}
                onChangeText={(text) => onChange(Number(text))}
                keyboardType="phone-pad"
                className="border-[0.8px] border-gray-200 rounded-xl px-[12px] py-2.5 text-sm font-normal text-gray-150"
              />
            )}
          />
        </View>

        {/* Password Field */}
        <View className="flex flex-col gap-y-[6px]">
          <Text className="text-black-200 text-base leading-[22px] font-normal">
            Password
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                autoCapitalize="none"
                textContentType="password"
                className="border-[0.8px] border-gray-200 rounded-xl px-[12px] py-2.5 text-sm font-normal text-gray-150"
              />
            )}
          />
        </View>
      </View>

      <GoogleSignUp />

      <View className="flex flex-col gap-y-3 items-center w-full">
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={!isFormValid}
          className={`w-full rounded-full py-4 flex flex-row justify-center custom-shadow gap-x-2 ${
            isFormValid ? "bg-primary" : "bg-primary/50"
          }`}
        >
          <Text className="text-white text-base font-normal">
            Create account
          </Text>
        </TouchableOpacity>

        <Text className="text-xs font-normal text-gray-100 tracking-tight">
          Already have an account? 
          <Pressable onPress={() => router.push("/login")}>
            <Text className="underline text-primary">Log in</Text>
          </Pressable>
        </Text>
      </View>
    </View>
  );
}
