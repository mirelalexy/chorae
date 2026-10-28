import { colors, space } from "@/theme";
import { api } from "../api/client";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Wordmark } from "@/components/Wordmark";

export default function Index() {
	const [status, setStatus] = useState("Checking the API...");

  	useEffect(() => {
    	api<{ ok: boolean }>("/health")
      		.then((res) => setStatus(res.ok ? "Connected to the API." : "The API answered, but not OK."))
      		.catch((err) => setStatus(err.message));
  	}, []);

  	return (
    	<View style={styles.container}>
			<Wordmark size={48} />
			<Text style={styles.heading}>Tell Rae a moment.</Text>
			<Text style={styles.muted}>Get back a mixtape.</Text>
			<Text style={styles.muted}>Current status: {status}</Text>
		</View>
  	);
}

const styles = StyleSheet.create({
	container: {
    	flex: 1,
    	justifyContent: "center",
		padding: space.xl,
		gap: space.lg,
  	},

	heading: {
		color: colors.text,
	},

	muted: {
		color: colors.textMuted,
	},
});
