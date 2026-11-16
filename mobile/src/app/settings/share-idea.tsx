
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ComingSoon } from "@/components/settings/ComingSoon";
import { LightbulbIcon } from "@/components/icons";

// Feature suggestions and feedback are coming soon.
export default function ShareIdea() {
    return (
        <Screen>
            <PageHeader title="Share an idea" />
            <ComingSoon
                icon={LightbulbIcon}
                title="Got something in mind?"
                body="A little improvement or a whole new idea? Soon, there'll be a place to share what you'd love to see in Chorae."
                planned={[
                    "Suggest features you'd love to see",
                    "Share ideas for improving Chorae",
                    "Send feedback in your own words",
                ]}
            />
        </Screen>
    );
}