
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { getMixtape, type Mixtape } from "@/api/mixtapes";
import { AlbumCover } from "@/components/AlbumCover";
import { Screen } from "@/components/Screen";
import { colors, space, type } from "@/theme";

export default function MixtapePage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [tape, setTape] = useState<Mixtape | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let current = true;

        setTape(null);
        setError(null);

        getMixtape(id)
            .then((found) => {
                if (current) setTape(found);
            })
            .catch((err) => {
                if (current) setError(err instanceof Error ? err.message : "Couldn't load this tape.");
            });

        return () => {
            current = false;
        };
    }, [id]);

    return (
        <Screen>
            <View style={styles.top}>
                <Pressable
                    onPress={() => router.canGoBack() ? router.back() : router.navigate("/tapes")}
                    accessibilityRole="button"
                    hitSlop={12}
                >
                    <Text style={styles.back}>Back</Text>
                </Pressable>
            </View>

            {error ? (
                <Text style={styles.error}>{error}</Text>
            ) : !tape ? (
                <ActivityIndicator color={colors.textMuted} />
            ) : (
                <>
                    <Text style={styles.title}>{tape.title}</Text>
                    <Text style={styles.intro}>{tape.intro}</Text>

                    {tape.sides.map((side, index) => (
                        <View key={index} style={styles.side}>
                            <Text style={styles.sideTitle}>{side.title}</Text>

                            {side.tracks.map((track, index) => (
                                <View key={`${track.mbid}-${index}`} style={styles.track}>
                                    <AlbumCover url={track.coverUrl} title={track.title} size={48} />

                                    <View style={styles.trackText}>
                                        <Text style={styles.trackTitle}>{track.title}</Text>
                                        <Text style={styles.trackArtist}>{track.artist}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))}
                </>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    top: {
        minHeight: 44,
        justifyContent: "center",
        alignItems: "flex-start",
    },

    back: {
        ...type.bodyMedium,
        color: colors.textMuted,
    },

    error: {
        ...type.body,
        color: colors.error,
    },

    title: {
        ...type.title,
        color: colors.text,
    },

    intro: {
        ...type.body,
        color: colors.textMuted,
    },

    side: {
        gap: space.sm,
        marginTop: space.md,
    },

    sideTitle: {
        ...type.heading,
        fontSize: 20,
        color: colors.text,
    },

    track: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
    },

    trackText: {
        flex: 1,
        gap: 2,
    },

    trackTitle: {
        ...type.bodyMedium,
        color: colors.text,
    },

    trackArtist: {
        ...type.small,
        color: colors.textMuted,
    },
});
