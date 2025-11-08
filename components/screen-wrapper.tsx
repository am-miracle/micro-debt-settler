// app/components/ScreenWrapper.tsx
import { ScrollView, View, StyleSheet } from "react-native";
import React from "react";

export default function ScreenWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
