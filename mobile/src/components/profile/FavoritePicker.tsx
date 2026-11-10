import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { searchSongs } from "@/api/mixtapes";
import { clearFavorite, setFavorite, type Favorite, type FavoriteKind } from "@/api/profile";
import { searchAlbums, searchArtists } from "@/api/taste";
import { AlbumCover } from "@/components/AlbumCover";
import { Avatar } from "@/components/Avatar";
import { MagnifyingGlassIcon } from "@/components/icons";
import { PickRow } from "@/components/PickRow";
import { TextField } from "@/components/TextField";
import { FavoriteArt } from "@/components/profile/FavoriteArt";
import { useSearch } from "@/hooks/useSearch";
import { colors, space, type } from "@/theme";

// A search result in the shape a favorite is saved in, and a line to tell lookalikes apart.
type Candidate = Favorite & { detail: string };

// Outside the component so each search function stays the same between renders.
const FIND: Record<FavoriteKind, (q: string) => Promise<Candidate[]>> = {
    artist: async (q) =>
        (await searchArtists(q)).map((a) => ({
            mbid: a.mbid,
            name: a.name,
            artist: null,
            year: null,
            coverUrl: null,
            detail: [a.disambiguation, a.country].filter(Boolean).join(", "),
        })),
    album: async (q) =>
        (await searchAlbums(q)).map((a) => ({
            mbid: a.mbid,
            name: a.title,
            artist: a.artist,
            year: a.year,
            coverUrl: a.coverUrl,
            detail: [a.artist, a.year].filter(Boolean).join(", "),
        })),
    song: async (q) =>
        (await searchSongs(q)).map((s) => ({
            mbid: s.mbid,
            name: s.title,
            artist: s.artist,
            year: s.year,
            coverUrl: s.coverUrl,
            detail: [s.artist, s.year].filter(Boolean).join(", "),
        })),
};

const PLACEHOLDER: Record<FavoriteKind, string> = {
    artist: "Search artists",
    album: "Search albums",
    song: "A song or an artist",
};

type Props = {
    kind: FavoriteKind;
    label: string;
    favorite: Favorite | null;
    onChange: (favorite: Favorite | null) => void;
};

// Pick one favorite of a kind. It's saved the moment user picks or removes it.
export function FavoritePicker({ kind, label, favorite, onChange }: Props) {
    const search = useSearch(FIND[kind]);

    const [changing, setChanging] = useState(false);
    const [saving, setSaving] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function pick(candidate: Candidate) {
        if (saving) return;
        setSaving(candidate.mbid);
        setError(null);

        try {
            const { detail: _, ...pick } = candidate;
            onChange(await setFavorite(kind, pick));
            setChanging(false);
            search.setQuery("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't save that.");
        } finally {
            setSaving(null);
        }
    }

    async function remove() {
        setError(null);

        try {
            await clearFavorite(kind);
            onChange(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't remove that.");
        }
    }

    const searching = !favorite || changing;

    return (
        <View style={styles.picker}>
            <Text style={styles.label}>{label}</Text>

            {favorite && (
                <View style={styles.current}>
                    <FavoriteArt kind={kind} favorite={favorite} size={56} />
                    <View style={styles.info}>
                        <Text style={styles.name} numberOfLines={1}>
                            {favorite.name}
                        </Text>
                        {favorite.artist ? (
                            <Text style={styles.detail} numberOfLines={1}>
                                {favorite.artist}
                            </Text>
                        ) : null}
                    </View>
                    <TextButton
                        title={changing ? "Cancel" : "Change"}
                        label={`${changing ? "Cancel changing" : "Change"} ${label.toLowerCase()}`}
                        onPress={() => {
                            setChanging((now) => !now);
                            search.setQuery("");
                        }}
                    />
                    <TextButton title="Remove" label={`Remove ${label.toLowerCase()}`} onPress={remove} />
                </View>
            )}

            {searching ? (
                <>
                    <TextField
                        label={`Search for your ${label.toLowerCase()}`}
                        hideLabel
                        icon={MagnifyingGlassIcon}
                        clearable
                        placeholder={PLACEHOLDER[kind]}
                        value={search.query}
                        onChangeText={search.setQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                    />

                    {search.loading ? <ActivityIndicator color={colors.textMuted} /> : null}
                    {search.error ? <Text style={styles.error}>{search.error}</Text> : null}
                    {search.empty ? <Text style={styles.detail}>Nothing found for "{search.search}".</Text> : null}

                    {search.active ? (
                        <View>
                            {search.results.slice(0, 6).map((candidate) => (
                                <PickRow
                                    key={candidate.mbid}
                                    image={
                                        kind === "artist" ? (
                                            <Avatar name={candidate.name} size={48} />
                                        ) : (
                                            <AlbumCover url={candidate.coverUrl} title={candidate.name} size={48} />
                                        )
                                    }
                                    title={candidate.name}
                                    detail={candidate.detail}
                                    picked={candidate.mbid === favorite?.mbid}
                                    busy={saving === candidate.mbid}
                                    onPress={() => pick(candidate)}
                                />
                            ))}
                        </View>
                    ) : null}
                </>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

function TextButton({ title, label, onPress }: { title: string; label: string; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={styles.textButton}>
            {({ pressed }) => <Text style={[styles.textButtonLabel, pressed && styles.pressed]}>{title}</Text>}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    picker: {
        gap: space.md,
    },

    label: {
        ...type.label,
        color: colors.textMuted,
    },

    current: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
    },

    info: {
        flex: 1,
        gap: 2,
    },

    name: {
        ...type.bodyMedium,
        color: colors.text,
    },

    detail: {
        ...type.small,
        color: colors.textMuted,
    },

    textButton: {
        minHeight: 44,
        justifyContent: "center",
    },

    textButtonLabel: {
        ...type.label,
        color: colors.accent,
    },

    pressed: {
        opacity: 0.6,
    },

    error: {
        ...type.small,
        color: colors.error,
    },
});
