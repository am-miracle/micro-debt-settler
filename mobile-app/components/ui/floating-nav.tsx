import { ReactNode } from "react";
import { View, TouchableOpacity } from "react-native";
import { Href, useRouter, usePathname } from "expo-router";
import HomeIcon from "../icons/home";
import PaymentIcon from "../icons/payment";
import UserIcon from "../icons/user";
import SettingIcon from "../icons/settings";

interface NavItem {
  key: string;
  link: Href;
}

export default function FloatingNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { key: "home", link: "/home" },
    { key: "payment", link: "/payment" },
    { key: "profile", link: "/profile" },
    { key: "settings", link: "/settings" },
  ];

  const renderIcon = (key: string, color: string) => {
    switch (key) {
      case "home":
        return <HomeIcon color={color} />;
      case "payment":
        return <PaymentIcon color={color} />;
      case "profile":
        return <UserIcon color={color} />;
      case "settings":
        return <SettingIcon color={color} />;
      default:
        return null;
    }
  };

  return (
    <View className="absolute bottom-20 left-8 right-8 bg-white p-2 rounded-full shadow-nav flex flex-row items-center justify-between">
      {navItems.map((item, index) => {
        const isActive = pathname === item.link;
        const iconColor = isActive ? "#00BFA6" : "#A1A1A1";

        return (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(item.link)}
            className={`h-[60px] w-[60px] flex items-center justify-center rounded-full transition-all duration-300 ${
              isActive ? "bg-accent" : "bg-transparent"
            }`}
          >
            {renderIcon(item.key, iconColor)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
