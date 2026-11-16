
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ComingSoon } from "@/components/settings/ComingSoon";
import { HeartIcon } from "@/components/icons";

// Not built yet: editing the music preferences chosen during onboarding.
export default function YourTaste() {
    return (
        <Screen>
            <PageHeader title="Your taste" />
            <ComingSoon
                icon={HeartIcon}
                title="Still into the same songs?"
                body="Tastes change. Sometimes overnight. Soon, you'll be able to add new artists, let go of old ones, or start from scratch."
                planned={[
                    "Add or remove artists and albums",
                    "Search for new music to add to your taste",
                    "Start over without losing your profile favorites",
                ]}
            />
        </Screen>
    );
}