import type { Icon } from "phosphor-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, space, type } from "@/theme";

type Props = {
    icon: Icon;
    title: string;
    body: string;
    planned: string[];
};

// A settings page for something that isn't built yet.
export function ComingSoon({ icon: PageIcon, title, body, planned }: Props) {
    return (
        <View style={styles.wrap}>
            <View aria-hidden style={styles.icon}>
                <PageIcon color={colors.accent} size={32} />
            </View>

            <Text style={styles.badge}>Coming soon</Text>
            <Text style={styles.title} accessibilityRole="header">
                {title}
            </Text>

            <Text style={styles.body}>{body}</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>What you'll find here</Text>
                
                {planned.map((line) => (
                    <View key={line} style={styles.item}>
                        <View aria-hidden style={styles.dot} />
                        <Text style={styles.itemText}>{line}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignItems: "center",
        gap: space.sm,
        marginTop: space.xxl,
    },

    icon: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: colors.glow,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: space.md,
    },

    badge: {
        ...type.label,
        color: colors.accent,
    },

    title: {
        ...type.heading,
        color: colors.text,
        textAlign: "center",
    },

    body: {
        ...type.body,
        color: colors.textMuted,
        textAlign: "center",
        maxWidth: 320,
    },

    card: {
        alignSelf: "stretch",
        gap: space.md,
        marginTop: space.xl,
        padding: space.lg,
        borderRadius: radius.card,
        backgroundColor: colors.field,
        borderWidth: 1,
        borderColor: colors.line,
    },

    cardTitle: {
        ...type.label,
        color: colors.textMuted,
    },

    item: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: space.md,
    },

    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.accent,
        marginTop: 8,
    },

    itemText: {
        ...type.body,
        color: colors.text,
        flex: 1,
    },
});