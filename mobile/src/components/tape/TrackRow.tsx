import { Track } from "@/api/mixtapes";
import { colors, radius, space, type } from "@/theme";
import { trackLength } from "@/utils/format";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AlbumCover } from "../AlbumCover";

type Props = {
    track: Track;
    number: number;
    isLast?: boolean;
};

const COVER_SIZE = 44;

// A track that expands to reveal Rae's note.
export function TrackRow({ track, number, isLast = false }: Props) {
    const [expanded, setExpanded] = useState(false);
    const pickedBy = track.isSeed ? "You" : "Rae";
    const length = trackLength(track.lengthMs);

    return (
        <View style={[styles.container, isLast && styles.last]}>
            <Pressable
                onPress={() => setExpanded((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={`${number}. ${track.title} by ${track.artist}, ${length}. ${pickedBy} picked this.`}
                accessibilityHint={expanded ? "Hide Rae's note" : "Show Rae's note"}
                accessibilityState={{ expanded }}
                style={({ pressed }) => [
                    styles.row,
                    pressed && styles.pressed
                ]}
            >
                <View style={[
                    styles.marker,
                    track.isSeed && styles.markerYours
                ]}/>

                <Text style={styles.number}>{number}</Text>

                <AlbumCover 
                    url={track.coverUrl}
                    title={track.title}
                    size={COVER_SIZE}
                />

                <View style={styles.details}>
                    <Text style={styles.title} numberOfLines={1}>
                        {track.title}
                    </Text>

                    <Text style={styles.artist} numberOfLines={1}>
                        {track.artist}
                    </Text>
                </View>

                <Text style={styles.length}>{length}</Text>
            </Pressable>

            {expanded && (
                <View style={styles.note}>
                    <Text style={styles.noteLabel}>Rae's note</Text>
                    <Text style={styles.noteText}>{track.note}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.line,
    },

    row: {
        minHeight: 64,
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        paddingVertical: space.xs + 2,
    },

    pressed: {
        opacity: 0.7,
    },

    marker: {
        width: 10,
        height: 10,
        borderRadius: 3,
        backgroundColor: colors.line,
    },

    markerYours: {
        backgroundColor: colors.accent,
    },

    number: {
        ...type.label,
        width: 18,
        fontFamily: type.body.fontFamily,
        textAlign: "right",
        color: colors.textMuted,
    },

    details: {
        flex: 1,
        gap: 2,
    },

    title: {
        ...type.bodyMedium,
        color: colors.text,
    },

    artist: {
        ...type.small,
        color: colors.textMuted,
    },

    length: {
        ...type.label,
        fontFamily: type.body.fontFamily,
        color: colors.textMuted,
    },

    note: {
        gap: space.sm,
        marginTop: space.xs,
        marginBottom: space.md,
        padding: space.md + 2,
        borderRadius: radius.field,
        backgroundColor: colors.field,
    },

    noteLabel: {
        ...type.small,
        color: colors.accent,
    },

    noteText: {
        ...type.body,
        fontSize: 15,
        lineHeight: 23,
        color: colors.text,
    },

    last: {
        borderBottomWidth: 0,
    },
});