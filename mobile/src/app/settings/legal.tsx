import { router } from "expo-router";
import { FileTextIcon } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ICON_INSET, SettingsGroup } from "@/components/settings/SettingsGroup";
import { SettingsRow } from "@/components/settings/SettingsRow";

// Inform user of the privacy policy and the terms of service.
export default function Legal() {
    return (
        <Screen>
            <PageHeader title="Legal" />

            <SettingsGroup inset={ICON_INSET}>
                <SettingsRow icon={FileTextIcon} title="Privacy policy" subtitle="How Chorae handles your information" onPress={() => router.push("/settings/privacy-policy")} />
                <SettingsRow icon={FileTextIcon} title="Terms of service" subtitle="The rules for using Chorae" onPress={() => router.push("/settings/terms-of-service")} />
            </SettingsGroup>
        </Screen>
    );
}