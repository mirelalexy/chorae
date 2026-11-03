import { colors, space, type } from "@/theme";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
    step: number;
    steps: number;
    onSkip: () => void;
    back?: boolean;
};

export function StepHeader({ step, steps, onSkip, back = false }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.side}>
                {back ? (
                    <Pressable
                        onPress={() => router.back()}
                        accessibilityRole="button"
                        hitSlop={12}
                    >
                        <Text style={[type.bodyMedium, styles.actionText]}>
                            Back
                        </Text>
                    </Pressable>
                ) : null
                }
            </View>

            <View
                accessibilityRole="progressbar"
                accessibilityLabel={`Step ${step} of ${steps}`}
                style={styles.progress}
            >
                {Array.from({ length: steps }, (_, i) => (
                    <View 
                        key={i}
                        style={[styles.progressSegment, { 
                            backgroundColor: i < step ? colors.accent : colors.line
                        }]}
                    />
                ))}
            </View>

            <Pressable
                onPress={onSkip}
                accessibilityRole="button"
                hitSlop={12}
                style={[styles.side, styles.skip]}
            >
                <Text style={[type.bodyMedium, styles.actionText]}>
                    Skip
                </Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 44,
    },

    side: {
        width: 60,
    },

    actionText: {
        color: colors.textMuted,
    },

    progress: {
        flexDirection: "row",
        gap: space.xs + 2,
    },

    progressSegment: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },

    skip: {
        alignItems: "flex-end",
    },
});