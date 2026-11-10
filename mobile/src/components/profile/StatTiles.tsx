import { StyleSheet, Text, View } from "react-native";
import { colors, radius, space, type } from "@/theme";

// A few stats side by side: big numbers with small labels under them.
export function StatTiles({ stats }: { stats: { value: number; label: string }[] }) {
    return (
        <View style={styles.row}>
            {stats.map((stat) => (
                <View key={stat.label} style={styles.tile} accessible accessibilityLabel={`${stat.value} ${stat.label}`}>
                    <Text style={styles.value}>{stat.value}</Text>
                    <Text style={styles.label}>{stat.label}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        gap: space.sm + 2,
    },

    tile: {
        flex: 1,
        alignItems: "center",
        gap: 2,
        paddingVertical: space.lg,
        paddingHorizontal: space.xs,
        borderRadius: radius.card,
        backgroundColor: colors.field,
    },

    value: {
        ...type.heading,
        color: colors.accent,
    },

    label: {
        ...type.small,
        color: colors.textMuted,
        textAlign: "center",
    },
});