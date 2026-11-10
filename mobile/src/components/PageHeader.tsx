import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CaretLeftIcon } from "@/components/icons";
import { colors, space, type } from "@/theme";

// A page's top row: back on the left and the page's name in the middle.
export function PageHeader({ title }: { title: string }) {
    return (
        <View style={styles.row}>
            <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Back"
                hitSlop={8}
                style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            >
                <CaretLeftIcon color={colors.text} size={22} />
            </Pressable>

            <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
                {title}
            </Text>

            <View style={styles.back} />
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 44,
        marginHorizontal: -space.sm,
    },

    back: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },

    pressed: {
        opacity: 0.6,
    },

    title: {
        ...type.bodyMedium,
        flex: 1,
        textAlign: "center",
        color: colors.text,
    },
});
