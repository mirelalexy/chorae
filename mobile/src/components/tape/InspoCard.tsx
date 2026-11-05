
import { StyleSheet, Text, View } from "react-native";
import { AlbumCover } from "@/components/AlbumCover";
import { colors, radius, space, type } from "@/theme";
import type { SeedPlacement } from "@/utils/mixtape";

// A must-have song and its position in the finished tape.
export function InspoCard({ seed }: { seed: SeedPlacement }) {
    const { track, place } = seed;

    return (
        <View
            style={styles.card}
            accessible
            accessibilityLabel={`${track.title} by ${track.artist}. ${place}.`}
        >
            <AlbumCover url={track.coverUrl} title={track.title} size={56} />

            <View style={styles.text}>
                <Text style={styles.title} numberOfLines={1}>
                    {track.title}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                    {track.artist}
                </Text>
            </View>

            <Text style={styles.place} numberOfLines={2}>
                {place}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.md + 2,
        padding: space.md,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.field,
    },

    text: {
        flex: 1,
        gap: 2,
    },

    title: {
        ...type.button,
        color: colors.text,
    },

    artist: {
        ...type.label,
        fontFamily: type.body.fontFamily,
        color: colors.textMuted,
    },

    place: {
        ...type.small,
        flexShrink: 0,
        textAlign: "right",
        color: colors.textMuted,
    },
});