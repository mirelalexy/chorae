import { Text, View, StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";

// An artist's initials in a circle. Later, this is where a photo can go.
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]!.toUpperCase())
        .join("");

    return (
        <View
            aria-hidden
            style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
        >
            <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.line,
        alignItems: "center",
        justifyContent: "center",
    },

    initials: {
        fontFamily: fonts.semibold,
        color: colors.text,
    },
});