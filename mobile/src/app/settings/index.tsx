import { StyleSheet, View } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { colors, space, type } from "@/theme";
import { router } from "expo-router";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { useProfile } from "@/hooks/useProfile";
import { BellIcon, FileTextIcon, HeadphonesIcon, HeadsetIcon, HeartIcon, InfoIcon, ShareNetworkIcon, SparkleIcon } from "@/components/icons";

export default function Settings() {
    const { user, logOut } = useAuth();
    const { page } = useProfile();

    return (
        <Screen>
            <PageHeader title="Settings" />

            <SettingsGroup variant="account">
                <SettingsRow
                    variant="account"
                    title={user?.displayName ?? ""}
                    subtitle={user?.email}
                    avatarUrl={page?.profile.avatarUrl ?? null}
                    onPress={() => router.push("/settings/account")}
                />
            </SettingsGroup>

            <SettingsGroup title="Your music">
                <SettingsRow
                    icon={HeartIcon}
                    title="Your taste"
                    subtitle="Artists and albums you love"
                    onPress={() => router.push("/settings/taste")}
                />

                <SettingsRow
                    icon={SparkleIcon}
                    title="Rae"
                    subtitle="Personalize your mixtapes"
                    onPress={() => router.push("/settings/rae")}
                />

                <SettingsRow
                    icon={HeadphonesIcon}
                    title="Listening"
                    subtitle="Where your tapes play"
                    onPress={() => router.push("/settings/listening")}
                />
            </SettingsGroup>

            <SettingsGroup title="Privacy & notifications">
                <SettingsRow
                    icon={BellIcon}
                    title="Notifications"
                    subtitle="Generation alerts, reminders"
                    onPress={() => router.push("/settings/notifications")}
                />

                <SettingsRow
                    icon={ShareNetworkIcon}
                    title="Sharing"
                    subtitle="Public mixtape links, visibility"
                    onPress={() => router.push("/settings/sharing")}
                />
            </SettingsGroup>

            <SettingsGroup title="Help & about">
                <SettingsRow
                    icon={InfoIcon}
                    title="About Chorae"
                    subtitle="The story behind the mixtapes"
                    onPress={() => router.push("/settings/about")}
                />

                <SettingsRow
                    icon={HeadsetIcon}
                    title="Help & support"
                    subtitle="Questions, answers, and feedback"
                    onPress={() => router.push("/settings/help")}
                />

                <SettingsRow
                    icon={FileTextIcon}
                    title="Legal"
                    subtitle="Privacy policy and terms of service"
                    onPress={() => router.push("/settings/legal")}
                />
            </SettingsGroup>

            <View style={styles.footer}>
                <Button title="Log out" variant="secondary" onPress={logOut} />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    account: {
        gap: space.xs,
        marginTop: space.lg,
    },

    label: {
        ...type.label,
        color: colors.textMuted,
    },

    email: {
        ...type.bodyMedium,
        color: colors.text,
    },

    footer: {
        marginTop: "auto",
    },
});
