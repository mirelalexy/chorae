
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ComingSoon } from "@/components/settings/ComingSoon";
import { QuestionIcon } from "@/components/icons";

// Answers to common questions are coming soon.
export default function FAQ() {
    return (
        <Screen>
            <PageHeader title="FAQs" />
            <ComingSoon
                icon={QuestionIcon}
                title="A little help, right here."
                body="Some things deserve a little explaining. Soon, you'll find answers to the questions that come up along the way."
                planned={[
                    "Get to know how Rae works",
                    "Find help with creating and managing mixtapes",
                    "Answers to common account questions",
                ]}
            />
        </Screen>
    );
}