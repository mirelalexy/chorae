import { colors, space, type } from "@/theme";
import { Text, View, StyleSheet } from "react-native";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/Button";
import { useAuth } from "@/auth/AuthProvider";
import { Screen } from "@/components/Screen";

function greeting() {
	const hour = new Date().getHours();
	if (hour < 12) return "Morning";
	if (hour < 18) return "Afternoon";
	return "Evening";
}

export default function Home() {
	const { user, logOut } = useAuth(); 

  	return (
    	<Screen>
            <View style={styles.heading}>
                <Wordmark size={30} />
                <Text style={styles.title}>
                    {greeting()}, {user?.displayName ?? "there"}.
                </Text>
            </View>

            <View style={styles.footer}>
                <Button title="Log out" onPress={logOut} />
            </View>
        </Screen>
  	);
}

const styles = StyleSheet.create({
    heading: {
        gap: space.md,
        marginTop: space.xxl,
    },
    title: {
        ...type.title,
        color: colors.text,
    },
    footer: {
        marginTop: "auto",
    },
});