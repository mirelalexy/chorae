
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getMixtape, type Mixtape } from "@/api/mixtapes";
import { AlbumCover } from "@/components/AlbumCover";
import { Screen } from "@/components/Screen";
import { colors, space, type } from "@/theme";
import { useMixtape } from "@/hooks/useMixtape";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { coversOf, mixOf, seedsOf } from "@/utils/mixtape";
import { TapeCover } from "@/components/tape/TapeCover";
import { KIND } from "@/components/tapes/TapeItem";
import { duration } from "@/utils/format";
import { Section } from "@/components/Section";
import { InspoCard } from "@/components/tape/InspoCard";
import { MixBar } from "@/components/tape/MixBar";
import { SideTracks } from "@/components/tape/SideTracks";

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
                <Text style={styles.title} accessibilityRole="header">
                    {tape.title}
                </Text>

                <Text style={styles.meta}>
                    {KIND[tape.origin]} · {tracks.length} {tracks.length === 1 ? "song" : "songs"} · {duration(totalMs)}
                </Text>

                {seeds.length > 0 && (
                    <Section
                        title="Inspo"
                        subtitle={
                            seeds.length === 1
                                ? "You named this song as the blueprint for this mixtape."
                                : "You named these songs as the blueprint for this mixtape."
                        }
                    >
                        {seeds.map((seed, index) => (
                            <InspoCard key={`${seed.track.mbid}`} seed={seed} />
                        ))}
                    </Section>
                )}

                {tape.missingSeeds.length > 0 && (
                    <Text style={styles.missing}>
                        Rae couldn't find
                        {tape.missingSeeds.map((seed) => `${seed.title} by ${seed.artist}`).join(", ")},
                        so the tape was made without {tape.missingSeeds.length === 1 ? "it" : "them"}.
                    </Text>
                )}

                <Section title="Rae's notes">
                    <Text style={styles.intro}>{tape.intro}</Text>
                </Section>

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

    // Overlap the artwork where fading/gradient will be introduced.
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
});