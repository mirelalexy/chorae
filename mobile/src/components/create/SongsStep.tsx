
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { searchSongs, type SongResult } from "@/api/mixtapes";
import { AlbumCover } from "@/components/AlbumCover";
import { Button } from "@/components/Button";
import { MagnifyingGlassIcon } from "@/components/icons";
import { PickRow } from "@/components/PickRow";
import { StepHeader } from "@/components/StepHeader";
import { TextField } from "@/components/TextField";
import { useSearch } from "@/hooks/useSearch";
import { colors, space, type } from "@/theme";

type Props = {
    picked: SongResult[];
    onPickedChange: (picked: SongResult[]) => void;
    onBack: () => void;
    onNext: () => void;
};

export function SongsStep({ picked, onPickedChange, onBack, onNext }: Props) {
    const songs = useSearch(searchSongs);

    function isPicked(song: SongResult) {
        return picked.some((selected) => selected.mbid === song.mbid);
    }

    function toggle(song: SongResult) {
        if (isPicked(song)) {
            onPickedChange(picked.filter((selected) => selected.mbid !== song.mbid));
        } else {
            onPickedChange([...picked, song]);
        }
    }

    // Show search results while searching, otherwise show selected songs.
    const list = songs.active ? songs.results : picked;
    const count = `${picked.length} ${picked.length === 1 ? "song" : "songs"} it has to have`;

    return (
        <>
            <StepHeader
                step={2}
                steps={3}
                back
                onBack={onBack}
                onSkip={onNext}
            />

            <View style={styles.intro}>
                <Text style={styles.title}>Anything I absolutely can't leave out?</Text>
                <Text style={styles.subtitle}>
                    Tell me which songs are must-haves. Otherwise, I'll assume you're trusting my excellent taste.
                </Text>
            </View>

            <TextField
                label="Search songs"
                hideLabel
                icon={MagnifyingGlassIcon}
                clearable
                placeholder="A song or an artist"
                value={songs.query}
                onChangeText={songs.setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />

            {songs.error ? <Text style={styles.error}>{songs.error}</Text> : null}
            {songs.loading ? <ActivityIndicator color={colors.textMuted} /> : null}

            <View>
                {list.map((song) => (
                    <PickRow
                        key={song.mbid}
                        image={
                            <AlbumCover
                                url={song.coverUrl}
                                title={song.title}
                                size={48}
                            />
                        }
                        title={song.title}
                        detail={[song.artist, song.year].filter(Boolean).join(", ")}
                        picked={isPicked(song)}
                        onPress={() => toggle(song)}
                    />
                ))}

                {songs.empty ? (
                    <Text style={styles.empty}>
                        No songs found for "{songs.search}".
                    </Text>
                ) : null}
            </View>

            <View style={styles.footer}>
                {picked.length > 0 ? (
                    <Text style={styles.count}>{count}</Text>
                ) : null}

                <Button title="Next" onPress={onNext} />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    intro: {
        gap: space.sm,
        marginTop: space.sm,
    },

    title: {
        ...type.title,
        color: colors.text,
    },

    subtitle: {
        ...type.body,
        color: colors.textMuted,
    },

    error: {
        ...type.small,
        color: colors.error,
    },

    empty: {
        ...type.body,
        color: colors.textMuted,
    },

    footer: {
        marginTop: "auto",
        gap: space.md,
        paddingTop: space.lg,
    },

    count: {
        ...type.small,
        color: colors.textMuted,
        textAlign: "center",
    },
});