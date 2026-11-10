import { StyleSheet, Text, View } from "react-native";
import { colors, radius, space, type } from "@/theme";

// Favorite genres as small tags.
export function GenreTags({ genres }: { genres: string[] }) {
    if (genres.length === 0) return null;
    
    return (
        <View 
            style={styles.tags} 
            accessible 
            accessibilityLabel={`Favorite genres: ${genres.join(", ")}`}
        >
            {genres.map((genre) => (
                <Text key={genre} style={styles.tag}>
                    {genre}
                </Text>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    tags: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: space.sm,
    },

    tag: {
        ...type.small,
        color: colors.text,
        paddingHorizontal: space.md,
        paddingVertical: space.xs + 1,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.line,
        overflow: "hidden",
    },
});