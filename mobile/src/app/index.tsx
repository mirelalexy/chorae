import { colors, space, type } from "@/theme";
import { api } from "@/api/client";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Wordmark } from "@/components/Wordmark";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";

export default function Index() {
	const [status, setStatus] = useState("Checking the API...");

	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

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

			<TextField label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
			<TextField label="Password" placeholder="10 or more characters" secureTextEntry error="That email and password don't match." />

			<Button 
				title="Log in" 
				loading={loading} 
				onPress={() => {
					setLoading(true);
					setTimeout(() => setLoading(false), 2000);
				}}
			/>
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
		...type.heading,
		color: colors.text,
	},

	muted: {
		...type.body,
		color: colors.textMuted,
	},
});
