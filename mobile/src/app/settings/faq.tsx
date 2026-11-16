
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { FaqItem } from "@/components/settings/FaqItem";
import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { FAQ } from "@/content/faq";
import { colors, space, type } from "@/theme";

export default function FAQs() {
    const [openQuestion, setOpenQuestion] = useState<string | null>(null);

    return (
        <Screen>
            <PageHeader title="FAQs" />

            <Text style={styles.intro}>
                A few things worth knowing about how Rae works alongside your tapes.
            </Text>

            {FAQ.map((section) => (
                <SettingsGroup key={section.title} title={section.title}>
                    {section.questions.map((item) => (
                        <FaqItem
                            key={item.question}
                            question={item.question}
                            answer={item.answer}
                            expanded={openQuestion === item.question}
                            onPress={() =>
                                setOpenQuestion((current) =>
                                    current === item.question
                                        ? null
                                        : item.question
                                )
                            }
                        />
                    ))}
                </SettingsGroup>
            ))}
        </Screen>
    );
}

const styles = StyleSheet.create({
    intro: {
        ...type.body,
        color: colors.textMuted,
        marginTop: space.sm,
    },
});