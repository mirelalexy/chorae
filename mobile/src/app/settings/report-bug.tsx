
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ComingSoon } from "@/components/settings/ComingSoon";
import { BugIcon } from "@/components/icons";

// Bug reporting is coming soon.
export default function ReportBug() {
    return (
        <Screen>
            <PageHeader title="Report a bug" />
            <ComingSoon
                icon={BugIcon}
                title="Something hit a wrong note?"
                body="Not everything goes according to the tracklist. Soon, you'll be able to share what's gone wrong and help make Chorae a little better."
                planned={[
                    "Describe what happened",
                    "Share what you expected instead",
                    "Send the details to help track down the issue",
                ]}
            />
        </Screen>
    );
}