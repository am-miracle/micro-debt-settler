import { ReactNode } from "react";
import { View, TouchableOpacity } from "react-native";
import HomeIcon from "../icons/home";
// import other icons as needed
import { Href, useRouter } from "expo-router";
import UserIcon from "../icons/user";
import PaymentIcon from "../icons/payment";
import SettingIcon from "../icons/settings";

interface NavItem {
  icon: ReactNode;
  link: Href; 
}

export default function FloatingNav() {
  const router = useRouter();

  // ✅ Step 1: Define your nav items
  const navItems: NavItem[] = [
    { icon: <HomeIcon />, link: "/home" },
    { icon: <PaymentIcon />, link: "/payment" },
    { icon: <UserIcon />, link: "/profile" },
    { icon: <SettingIcon />, link: "/settings" },
  ];

  // ✅ Step 2: Render them dynamically
  return (
    <View className="absolute bottom-20 left-8 right-8 bg-white p-2 rounded-full shadow-nav flex flex-row items-center justify-between">
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => router.push(item.link)}
          className="h-[60px] w-[60px] flex items-center justify-center rounded-full bg-accent"
        >
          {item.icon}
        </TouchableOpacity>
      ))}
    </View>
  );
}
