import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { colors, space, type } from "@/theme";
import { router } from "expo-router";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { ICON_INSET, SettingsGroup } from "@/components/settings/SettingsGroup";
import { DevicesIcon, EnvelopeIcon, LockKeyIcon, TrashIcon } from "@/components/icons";

export default function Account() {
    const { user } = useAuth();

    return (
        <Screen>
            <PageHeader title="Account" />

            <SettingsGroup title="Account details" inset={ICON_INSET}>
                <SettingsRow
                    icon={EnvelopeIcon}
                    title="Email address"
                    subtitle={user?.email}
                    onPress={() => router.push("/settings/account/email")}
                />
                <SettingsRow
                    icon={LockKeyIcon}
                    title="Change password"
                    onPress={() => router.push("/settings/account/password")}
                />
            </SettingsGroup>

            <SettingsGroup title="Security" inset={ICON_INSET}>
                <SettingsRow
                    icon={DevicesIcon}
                    title="Log out of all devices"
                    subtitle="End every active session, including this one."
                    onPress={() => console.log("TO DO")}
                    chevron={false}
                />
            </SettingsGroup>

            <SettingsGroup title="Danger zone" inset={ICON_INSET}>
                <SettingsRow
                    icon={TrashIcon}
                    title="Delete account"
                    subtitle="Permanently delete your account and data."
                    danger
                    onPress={() => router.push("/settings/account/delete")}
                />
            </SettingsGroup>

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
