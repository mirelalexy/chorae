
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ComingSoon } from "@/components/settings/ComingSoon";
import { LockKeyIcon } from "@/components/icons";

// The privacy policy is not yet written.
export default function PrivacyPolicy() {
    return (
        <Screen>
            <PageHeader title="Privacy policy" />
            <ComingSoon
                icon={LockKeyIcon}
                title="Privacy, explained."
                body="A clear look at what Chorae keeps, why it's needed, and how your information is handled."
                planned={[
                    "What information Chorae collects and why",
                    "How Rae and other services use that information",
                    "Your rights, and how to manage your data",
                ]}
            />
        </Screen>
    );
}