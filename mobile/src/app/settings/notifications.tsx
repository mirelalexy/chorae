import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ComingSoon } from "@/components/settings/ComingSoon";
import { BellIcon } from "@/components/icons";

// Not built yet: the app doesn't send notifications.
export default function Notifications() {
    return (
        <Screen>
            <PageHeader title="Notifications" />
            <ComingSoon
                icon={BellIcon}
                title="Know when your tape is ready"
                body="Rae takes a little while to mix. Soon you'll be able to leave and get a nudge when she's done."
                planned={[
                    "A notification when a tape is ready", 
                    "Find out if something went wrong during mixing", 
                    "Choose which notifications to receive",
                ]}
            />
        </Screen>
    );
}