import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { colors, radius, space, type } from "@/theme";
import { router } from "expo-router";
import { Text, View, StyleSheet} from "react-native";

// Onboarding, step one: artists.
export default function Artists() {
    return (
        <Screen>
            <View style={styles.intro}>
                <Text style={[type.title, { color: colors.text }]}>Artists you love</Text>
                <Text style={[type.body, { color: colors.textMuted }]}>Rae starts from these. Pick a few. Don't worry, you can change them later.</Text>
            </View>

            <TextField 
                label="Search artists"
                placeholder="Bad Omens, Ariana Grande..."
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />

            <View style={styles.footer}>
                <Text style={[type.small, styles.pickedCount]}>

                </Text>
                <Button 
                    title="Continue"
                    onPress={() => router.push("/onboarding/albums")}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    intro: {
        gap: space.sm,
    },

    pickedList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: space.sm,
    },

    pickedChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.sm,
        paddingLeft: 4,
        paddingRight: space.md,
        height: 40,
        borderRadius: radius.pill,
        backgroundColor: colors.field,
        borderWidth: 1,
        borderColor: colors.line,
    },

    footer: {
        marginTop: "auto",
        gap: space.md,
        paddingTop: space.lg,
    },

    pickedCount: {
        color: colors.textMuted,
        textAlign: "center",
    },
});