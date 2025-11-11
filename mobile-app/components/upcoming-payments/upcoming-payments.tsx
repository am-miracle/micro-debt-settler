import { Text, View } from "react-native";
import UpcomingPaymentsCard from "./upcoming-payment-card";

export default function UpcomingPayments() {
    return(
        <View className="flex flex-col gap-y-3">
        <Text className="text-black-100 font-roboto-medium font-medium text-lg tracking-tight">Upcoming Payments</Text>
        <UpcomingPaymentsCard/>
        </View>
    )
}