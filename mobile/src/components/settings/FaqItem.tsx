import { Pressable, StyleSheet, Text, View } from "react-native";
import { CaretDownIcon } from "@/components/icons";
import { colors, space, type } from "@/theme";

type Props = {
    question: string;
    answer: string;
    expanded: boolean;
    onPress: () => void;
};

export function FaqItem({ question, answer, expanded, onPress }: Props) {
    return (
        <View>
            <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                style={styles.question}
            >
                <Text style={styles.title}>{question}</Text>

                <CaretDownIcon
                    size={16}
                    color={colors.textMuted}
                    style={{
                        transform: [
                            { rotate: expanded ? "180deg" : "0deg" },
                        ],
                    }}
                />
            </Pressable>

            {expanded && (
                <Text style={styles.answer}>{answer}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    question: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: space.md,
        padding: space.lg,
    },

    title: {
        ...type.bodyMedium,
        color: colors.text,
        flex: 1,
    },
    
    answer: {
        ...type.body,
        color: colors.textMuted,
        lineHeight: 23,
        paddingHorizontal: space.lg,
        paddingBottom: space.lg,
    },
});