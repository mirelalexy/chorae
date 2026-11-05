
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Mixtape } from "@/api/mixtapes";
import { CaretDownIcon, CaretUpIcon } from "@/components/icons";
import { colors, radius, space, type } from "@/theme";
import { sideLetter, sideStats } from "@/utils/mixtape";
import { TrackRow } from "./TrackRow";

type Side = Mixtape["sides"][number];

type Props = {
    side: Side;
    index: number;
    start: number;
    startOpen?: boolean;
};

// Display a mixtape side as an expandable chapter.
export function SideChapter({ side, index, start, startOpen = false }: Props) {
    const [expanded, setExpanded] = useState(startOpen);
    const letter = sideLetter(index);
    const stats = sideStats(side);

    return (
        <View style={styles.card}>
            <Pressable
                onPress={() => setExpanded((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={`Side ${letter}: ${side.title}, ${stats}`}
                accessibilityHint={expanded ? "Hide the songs" : "Show the songs"}
                accessibilityState={{ expanded }}
                style={({ pressed }) => [styles.header, pressed && styles.pressed]}
            >
                <View style={styles.letter}>
                    <Text style={styles.letterText}>{letter}</Text>
                </View>

                <View style={styles.headerText}>
                    <Text style={styles.title} numberOfLines={2}>
                        {side.title}
                    </Text>
                    <Text style={styles.stats}>{stats}</Text>
                </View>

                {expanded ? (
                    <CaretUpIcon color={colors.textMuted} size={20} />
                ) : (
                    <CaretDownIcon color={colors.textMuted} size={20} />
                )}
            </Pressable>

            {expanded && (
                <View style={styles.body}>
                    <Text style={styles.mood}>{side.moodLine}</Text>
                    <View style={styles.divider} />

                    {side.tracks.map((track, trackIndex) => (
                        <TrackRow
                            key={`${track.mbid}-${trackIndex}`}
                            track={track}
                            number={start + trackIndex}
                            isLast={trackIndex === side.tracks.length - 1}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: radius.card + 2,
        borderWidth: 1,
        borderColor: colors.line,
        overflow: "hidden",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.md + 2,
        padding: space.md + 2,
    },

    pressed: {
        backgroundColor: colors.field,
    },

    letter: {
        width: 52,
        height: 52,
        borderRadius: radius.field,
        backgroundColor: colors.field,
        alignItems: "center",
        justifyContent: "center",
    },

    letterText: {
        ...type.heading,
        fontSize: 22,
        color: colors.accent,
    },

    headerText: {
        flex: 1,
        gap: 2,
    },

    title: {
        ...type.button,
        fontSize: 18,
        lineHeight: 23,
        color: colors.text,
    },

    stats: {
        ...type.small,
        color: colors.textMuted,
    },

    body: {
        paddingHorizontal: space.md + 2,
        paddingBottom: space.sm,
    },

    mood: {
        ...type.body,
        fontSize: 15,
        color: colors.textMuted,
    },

    divider: {
        height: 1,
        marginTop: space.md,
        marginBottom: space.xs,
        backgroundColor: colors.line,
    },
});
