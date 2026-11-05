import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, space, type } from "@/theme";

type Props = {
    title: string;
    subtitle?: string;
    aside?: string; // info on the right of the title, like "8 songs"
    action?: { label: string; onPress: () => void }; // or a button there, like "See all"
    children: ReactNode;
};

// A section includes a heading, an optional line under it, with info or an action, and what it holds.
export function Section({ title, subtitle, aside, action, children }: Props) {
    return (
        <View style={styles.section}>
            <View>
                <View style={styles.titleRow}>
                    <Text style={styles.title} accessibilityRole="header">
                        {title}
                    </Text>

                    {action ? (
                        <Pressable 
                            onPress={action.onPress} 
                            accessibilityRole="button" 
                            accessibilityLabel={`${action.label}: ${title}`} 
                            hitSlop={12}
                        >
                            {({ pressed }) => <Text style={[styles.action, pressed && styles.pressed]}>{action.label}</Text>}
                        </Pressable>
                    ) : aside ? (
                        <Text style={styles.aside}>{aside}</Text>
                    ) : null}
                </View>

                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: space.lg,
        marginTop: space.xxl + space.xs,
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "space-between",
    },

    title: {
        ...type.heading,
        flexShrink: 1,
        fontSize: 22,
        lineHeight: 26,
        color: colors.text,
    },

    aside: {
        ...type.label,
        fontFamily: type.body.fontFamily,
        color: colors.textMuted,
    },

    action: {
        ...type.label,
        color: colors.accent,
    },

    pressed: {
        opacity: 0.6,
    },

    subtitle: {
        ...type.body,
        fontSize: 15,
        lineHeight: 21,
        color: colors.textMuted,
    },
});
