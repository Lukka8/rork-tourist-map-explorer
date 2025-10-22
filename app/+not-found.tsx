import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { MapPin } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <MapPin size={64} color="#999" />
        <Text style={styles.title}>Location not found</Text>
        <Text style={styles.subtitle}>This page doesn&apos;t exist on the map</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return to Map</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#333",
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  link: {
    marginTop: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: "#007AFF",
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
