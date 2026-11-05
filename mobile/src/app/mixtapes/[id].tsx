
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, space, type } from "@/theme";
import { useMixtape } from "@/hooks/useMixtape";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { coversOf, mixOf, seedsOf } from "@/utils/mixtape";
import { TapeCover } from "@/components/tape/TapeCover";
import { KIND } from "@/components/tapes/TapeItem";
import { duration } from "@/utils/format";
import { Section } from "@/components/Section";
import { MixBar } from "@/components/tape/MixBar";
import { SideTracks } from "@/components/tape/SideTracks";
import { COVER_ROW_ITEM_SIZE, CoverRow } from "@/components/CoverRow";
import { AlbumCover } from "@/components/AlbumCover";
import { RaeNote } from "@/components/tape/RaeNote";

export default function MixtapePage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { tape, error, loading } = useMixtape(id);

    if (!tape) {
        return (
            <View style={[
                styles.center, 
                { paddingTop: insets.top }
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={colors.textMuted} />
                ) : (
                    <Text style={styles.error}>{error ?? "Couldn't load this tape."}</Text>
                )}
            </View>
        );
    }

    const tracks = tape.sides.flatMap((side) => side.tracks);
    const totalMs = tracks.reduce((sum, track) => sum + (track.lengthMs ?? 0), 0);
    const seeds = seedsOf(tape);
    const mix = mixOf(tape);

    // Keep track numbers continuous across sides.
    let nextTrack = 1;

    return (
        <ScrollView
            style={styles.page}
            contentContainerStyle={{ paddingBottom: insets.bottom + space.xxl }}
        >
            <TapeCover covers={coversOf(tape)} />

            <View style={styles.body}>
                <Text style={styles.kind}>{KIND[tape.origin]}</Text>
                <Text style={styles.title} accessibilityRole="header">
                    {tape.title}
                </Text>

                <Text style={styles.meta}>
                    {tracks.length} {tracks.length === 1 ? "song" : "songs"} · {duration(totalMs)} · {tape.sides.length} {tape.sides.length > 1 ? "sides" : "side"}
                </Text>

                <Text style={styles.summary}>{tape.summary}</Text>

                {seeds.length > 0 && (
                    <Section
                        title="Your inspiration"
                        aside={`${seeds.length} songs`}
                    >
                        <CoverRow 
                            items={seeds.map(({ track, place }) => ({
                                key: track.mbid,
                                art: (
                                    <AlbumCover 
                                        url={track.coverUrl}
                                        title={track.title}
                                        size={COVER_ROW_ITEM_SIZE}
                                    />
                                ),
                                title: track.title,
                                details: [track.artist, place]
                            }))}
                        />
                    </Section>
                )}

                {tape.missingSeeds.length > 0 && (
                    <Text style={styles.missing}>
                        Rae couldn't find
                        {tape.missingSeeds.map((seed) => `${seed.title} by ${seed.artist}`).join(", ")},
                        so the tape was made without {tape.missingSeeds.length === 1 ? "it" : "them"}.
                    </Text>
                )}

                <View style={styles.note}>
                    <RaeNote text={tape.intro} />
                </View>

                <Section title="The mix">
                    <MixBar yours={mix.yours} rae={mix.rae} />
                </Section>

                <Section title="Tracks" subtitle="Tap a song to read why it's here.">
                    {tape.sides.map((side, index) => {
                        const start = nextTrack;
                        nextTrack += side.tracks.length;

                        return (
                            <SideTracks
                                key={index}
                                side={side}
                                index={index}
                                start={start}
                            />
                        );
                    })}
                </Section>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.background,
    },

    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: space.xl,
        backgroundColor: colors.background,
    },

    // Overlap the artwork (gradient).
    body: {
        paddingHorizontal: space.xl,
        marginTop: -64,
    },

    title: {
        ...type.title,
        fontSize: 36,
        lineHeight: 40,
        letterSpacing: -0.9,
        color: colors.text,
    },

    meta: {
        ...type.body,
        fontSize: 15,
        color: colors.textMuted,
    },

    missing: {
        ...type.small,
        marginTop: space.md,
        color: colors.textMuted,
    },

    intro: {
        ...type.body,
        fontSize: 17,
        lineHeight: 26,
        color: colors.text,
    },

    error: {
        ...type.body,
        color: colors.error,
    },
    
    kind: {
        ...type.label,
        color: colors.accent,
        marginBottom: space.xs + 2,
    },

    summary: {
        ...type.body,
        color: colors.textMuted,
        marginTop: space.md,
    },

    note: {
        marginTop: space.xxl + space.xs,
    },
});