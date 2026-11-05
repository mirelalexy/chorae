
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { colors, space, type } from "@/theme";

export default function Remake() {
    return (
        <Screen>
            <View style={styles.body}>
                <Text style={styles.title}>Remakes are on their way.</Text>
                <Text style={styles.text}>
                    Soon you'll bring a playlist you have, and Rae will add to it or reshape it.
                </Text>
            </View>

            <View style={styles.footer}>
                <Button
                    title="Make one from a moment"
                    onPress={() => router.replace("/create")}
                />
                <Button
                    title="Back"
                    variant="secondary"
                    onPress={() => router.back()}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    body: {
        gap: space.sm,
        marginTop: space.xxl,
    },

    title: {
        ...type.title,
        color: colors.text,
    },

    text: {
        ...type.body,
        color: colors.textMuted,
    },

    footer: {
        marginTop: "auto",
        gap: space.md,
    },
});