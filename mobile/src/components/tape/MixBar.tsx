import { colors, space, type } from "@/theme";
import { StyleSheet, Text, View } from "react-native";

type Props = {
    yours: number;
    rae: number;
};

// Show how many tracks were chosen by user vs Rae.
export function MixBar({ yours, rae }: Props) {
    const total = yours + rae;
    const percentage = total > 0 ? (yours / total) * 100 : 0;

    return (
        <View
            style={styles.container}
            accessible
            accessibilityLabel={`${yours} picked by you, ${rae} picked by Rae`}
        >
            <View style={styles.bar}>
                <View style={[styles.filled, { width: `${percentage}%` }]} />
            </View>

            <View style={styles.legend}>
                <Legend color={colors.accent} label={`${yours} picked by you`} />
                <Legend color={colors.line} label={`${rae} picked by Rae`} />
            </View>
        </View>
    );
}

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <View style={styles.legendItem}>
            <View style={[styles.square, { backgroundColor: color }]} />
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: space.md,
    },

    bar: {
        height: 10,
        flexDirection: "row",
        overflow: "hidden",
        borderRadius: 5,
        backgroundColor: colors.line,
    },

    filled: {
        height: "100%",
        backgroundColor: colors.accent,
    },

    legend: {
        flexDirection: "row",
        gap: space.xl,
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.sm,
    },

    square: {
        width: 10,
        height: 10,
        borderRadius: 3,
    },

    label: {
        ...type.body,
        fontSize: 15,
        color: colors.text,
    },
});