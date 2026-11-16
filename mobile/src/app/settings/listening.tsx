import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ComingSoon } from "@/components/settings/ComingSoon";
import { HeadphonesIcon } from "@/components/icons";

// Not built yet: tapes don't export, and links for listening to individual tracks don't exist yet.
export default function Listening() {
    return (
        <Screen>
            <PageHeader title="Listening" />
            <ComingSoon
                icon={HeadphonesIcon}
                title="Good music travels."
                body="Your mixtapes have places to be. Soon, you'll be able to take them to your favorite music app."
                planned={["Choose your default streaming service", "Open individual tracks with a tap", "Export mixtapes to your music library"]}
            />
        </Screen>
    );
}