import Constants from "expo-constants";
import { StyleSheet, Text, View } from "react-native";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { Wordmark } from "@/components/Wordmark";
import { STORY } from "@/content/about";
import { colors, space, type } from "@/theme";
import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { router } from "expo-router";
import { PuzzlePieceIcon } from "@/components/icons";

// The story behind Chorae, and the app's version.
export default function About() {
    return (
        <Screen>
            <PageHeader title="About Chorae" />

            <View style={styles.hero}>
                <Wordmark />
                <Text style={styles.tagline}>There's a playlist for that. Probably.</Text>
            </View>

            <View style={styles.story}>
                {STORY.map((paragraph, index) => (
                    <Text key={index} style={styles.paragraph}>
                        {paragraph}
                    </Text>
                ))}
            </View>

            <SettingsGroup>
                <SettingsRow
                    icon={PuzzlePieceIcon}
                    title="Credits"
                    subtitle="The tools behind Chorae"
                    onPress={() => router.push("/settings/about/credits")}
                />
            </SettingsGroup>

            <Text style={styles.version}>Version {Constants.expoConfig?.version ?? "?"}</Text>
        </Screen>
    );
}

const styles = StyleSheet.create({
    hero: {
        alignItems: "center",
        gap: space.sm,
        marginTop: space.xl,
        marginBottom: space.lg,
    },

    tagline: {
        ...type.body,
        color: colors.accent,
    },

    story: {
        gap: space.lg,
        marginTop: space.md,
    },

    storyTitle: {
        ...type.heading,
        color: colors.text,
        marginBottom: space.xs,
    },

    paragraph: {
        ...type.body,
        fontSize: 16,
        lineHeight: 26,
        color: colors.text,
    },

    version: {
        ...type.small,
        color: colors.textMuted,
        textAlign: "center",
        marginTop: "auto",
        paddingTop: space.xl,
    },
});