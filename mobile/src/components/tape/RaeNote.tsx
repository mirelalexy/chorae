
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CaretDownIcon, CaretUpIcon, HeadphonesIcon } from "@/components/icons";
import { colors, radius, space, type } from "@/theme";

const MAX_PREVIEW_LENGTH = 220;
const PREVIEW_LINES = 4;

// Show longer notes collapsed, with an option to read the full text.
export function RaeNote({ text }: { text: string }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = text.length > MAX_PREVIEW_LENGTH;
    const isCollapsed = isLong && !expanded;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title} accessibilityRole="header">
                    A note from Rae
                </Text>
                <HeadphonesIcon color={colors.textMuted} size={20} />
            </View>

            <Text
                style={styles.text}
                numberOfLines={isCollapsed ? PREVIEW_LINES : undefined}
            >
                {text}
            </Text>

            {isLong && (
                <Pressable
                    onPress={() => setExpanded((prev) => !prev)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                    hitSlop={8}
                    style={styles.toggle}
                >
                    <Text style={styles.toggleText}>
                        {expanded ? "Show less" : "Read the full note"}
                    </Text>
                    {expanded ? (
                        <CaretUpIcon color={colors.text} size={16} />
                    ) : (
                        <CaretDownIcon color={colors.text} size={16} />
                    )}
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        gap: space.md,
        padding: space.xl,
        borderRadius: radius.card + 2,
        backgroundColor: colors.field,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    title: {
        ...type.heading,
        fontSize: 19,
        lineHeight: 24,
        color: colors.text,
    },

    text: {
        ...type.body,
        fontSize: 15,
        lineHeight: 26,
        color: colors.text,
    },

    toggle: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: space.xs + 2,
        minHeight: 32,
    },

    toggleText: {
        ...type.bodyMedium,
        color: colors.text,
        fontSize: 14,
    },
});