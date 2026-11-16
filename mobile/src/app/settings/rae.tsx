
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ComingSoon } from "@/components/settings/ComingSoon";
import { SparkleIcon } from "@/components/icons";

// Not built yet: preferences for how Rae curates mixtapes.
export default function Rae() {
    return (
        <Screen>
            <PageHeader title="Rae" />
            <ComingSoon
                icon={SparkleIcon}
                title="Rae likes a little direction."
                body="Give her a few starting preferences, and she'll remember them whenever you're making something new."
                planned={[
                    "Choose your default mixtape length",
                    "Set story mode on or off by default",
                    "Use your preferences for every new mixtape",
                ]}
            />
        </Screen>
    );
}
