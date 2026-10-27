import { api } from "../api/client";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  const [status, setStatus] = useState("Checking the API...");

  useEffect(() => {
    api<{ ok: boolean }>("/health")
      .then((res) => setStatus(res.ok ? "Connected to the API." : "The API answered, but not OK."))
      .catch((err) => setStatus(err.message));
  }, []);

  return (
    <View style={styles.container}>
      <Text>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
