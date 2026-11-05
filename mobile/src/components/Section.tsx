import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, space, type } from "@/theme";

// A section includes a heading, an optional line under it, and what it holds.
export function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
    return (
        <View style={styles.section}>
            <View style={styles.head}>
                <Text style={styles.title} accessibilityRole="header">
                    {title}
                </Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: space.md + 2,
        marginTop: space.xxl,
    },

    head: {
        gap: space.xs,
    },

    title: {
        ...type.heading,
        fontSize: 21,
        lineHeight: 26,
        color: colors.text,
    },

    subtitle: {
        ...type.body,
        fontSize: 15,
        lineHeight: 21,
        color: colors.textMuted,
    },
});