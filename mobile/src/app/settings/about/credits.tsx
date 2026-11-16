import * as WebBrowser from "expo-web-browser";
import { StyleSheet, Text, View } from "react-native";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { CREDITS } from "@/content/about";
import { colors, space, type } from "@/theme";

export default function Credits() {
    return (
        <Screen>
            <PageHeader title="Credits" />

            <View style={styles.intro}>
                <Text style={styles.heading}>
                    Good things are rarely made alone.
                </Text>

                <Text style={styles.description}>
                    A little appreciation for the projects that helped Chorae do its thing.
                </Text>
            </View>

            <SettingsGroup>
                {CREDITS.map((credit) => (
                    <SettingsRow
                        key={credit.name}
                        title={credit.name}
                        subtitle={credit.detail}
                        onPress={() =>
                            void WebBrowser.openBrowserAsync(credit.url)
                        }
                        external={true}
                    />
                ))}
            </SettingsGroup>
        </Screen>
    );
}

const styles = StyleSheet.create({
    intro: {
        gap: space.sm,
        marginTop: space.md,
        marginBottom: space.lg,
    },

    heading: {
        ...type.heading,
        color: colors.text,
    },

    description: {
        ...type.body,
        color: colors.textMuted,
        lineHeight: 23,
    },
});