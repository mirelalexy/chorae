
import { StyleSheet, Text, View } from "react-native";
import type { Mixtape } from "@/api/mixtapes";
import { colors, space, type } from "@/theme";
import { sideLetter } from "@/utils/mixtape";
import { TrackRow } from "./TrackRow";

type Side = Mixtape["sides"][number];

type Props = {
    side: Side;
    index: number;
    start: number;
};

// Display a side's title, mood, and numbered tracks.
export function SideTracks({ side, index, start }: Props) {
    const letter = sideLetter(index);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.letter}>Side {letter}</Text>
                <Text style={styles.title} accessibilityRole="header">
                    {side.title}
                </Text>
                <Text style={styles.mood}>{side.moodLine}</Text>
            </View>

            {side.tracks.map((track, trackIndex) => (
                <TrackRow
                    key={track.mbid}
                    track={track}
                    number={start + trackIndex}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: space.lg,
    },

    header: {
        gap: 2,
        marginBottom: space.xs,
    },

    letter: {
        ...type.label,
        fontFamily: type.button.fontFamily,
        color: colors.accent,
    },

    title: {
        ...type.heading,
        fontSize: 22,
        color: colors.text,
    },

    mood: {
        ...type.body,
        fontSize: 15,
        color: colors.textMuted,
    },
});