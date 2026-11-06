import { colors, space, type } from "@/theme";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { InfoIcon } from "./icons";

type Props = {
    mainText: string;
    additionalText: string | null;
};

// A row that expands with more info.
export function ExpandedRow({ mainText, additionalText }: Props) {
    const [expanded, setExpanded] = useState(false);

    return (
        <View>
            <Pressable
                onPress={() => setExpanded((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={mainText}
                accessibilityHint={expanded ? "Hide additional info" : "Show additional info"}
                accessibilityState={{ expanded }}
                style={({ pressed }) => [
                    styles.row,
                    pressed && styles.pressed
                ]}
            >
                <Text style={styles.mainText}>{mainText}</Text>
                <InfoIcon color={colors.accent} size={20} />
            </Pressable>

            {expanded && (
                <Text style={styles.additionalText}>{additionalText}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        paddingVertical: space.xs + 2,
    },

    pressed: {
        opacity: 0.7,
    },

    mainText: {
        ...type.bodyMedium,
        color: colors.accent,
    },

    additionalText: {
        ...type.small,
        color: colors.textMuted,
    },
});