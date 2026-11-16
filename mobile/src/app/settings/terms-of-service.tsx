
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ComingSoon } from "@/components/settings/ComingSoon";
import { FileTextIcon } from "@/components/icons";

// The terms of service are not available yet.
export default function TermsOfService() {
    return (
        <Screen>
            <PageHeader title="Terms of service" />
            <ComingSoon
                icon={FileTextIcon}
                title="The little details."
                body="A clear guide to using Chorae, what to expect from Rae, and what belongs to you."
                planned={[
                    "How Chorae and Rae work",
                    "Your content and responsibilities",
                    "The rules for using Chorae",
                ]}
            />
        </Screen>
    );
}
