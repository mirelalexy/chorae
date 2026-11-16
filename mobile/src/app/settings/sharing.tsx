import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ComingSoon } from "@/components/settings/ComingSoon";
import { ShareNetworkIcon } from "@/components/icons";

// Not built yet: tapes have a link already, but nothing shows them to other people.
export default function Sharing() {
    return (
        <Screen>
            <PageHeader title="Sharing" />
            <ComingSoon
                icon={ShareNetworkIcon}
                title="Share a tape with someone"
                body="For now your tapes are only yours. When sharing arrives, you'll decide what others see."
                planned={[
                    "Send a tape as a link anyone can open", 
                    "Choose whether your name and picture show on it", 
                    "Turn a tape's link off whenever you want",
                ]}
            />
        </Screen>
    );
}