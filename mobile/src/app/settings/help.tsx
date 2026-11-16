
import { router } from "expo-router";
import { QuestionIcon, BugIcon, LightbulbIcon } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ICON_INSET, SettingsGroup } from "@/components/settings/SettingsGroup";
import { SettingsRow } from "@/components/settings/SettingsRow";

// Answers, bug reports, and ideas for Chorae.
export default function Help() {
    return (
        <Screen>
            <PageHeader title="Help & support" />

            <SettingsGroup inset={ICON_INSET}>
                <SettingsRow
                    icon={QuestionIcon}
                    title="FAQs"
                    subtitle="Answers to common questions"
                    onPress={() => router.push("/settings/faq")}
                />
                <SettingsRow
                    icon={BugIcon}
                    title="Report a bug"
                    subtitle="Something not working as expected?"
                    onPress={() => router.push("/settings/report-bug")}
                />
                <SettingsRow
                    icon={LightbulbIcon}
                    title="Share an idea"
                    subtitle="Something you'd love Chorae to do"
                    onPress={() => router.push("/settings/share-idea")}
                />
            </SettingsGroup>
        </Screen>
    );
}