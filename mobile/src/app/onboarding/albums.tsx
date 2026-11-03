import { AlbumResult, albumsByArtist, searchAlbums } from "@/api/taste";
import { useAuth } from "@/auth/AuthProvider";
import { AlbumCover } from "@/components/AlbumCover";
import { Button } from "@/components/Button";
import { PickRow } from "@/components/PickRow";
import { Screen } from "@/components/Screen";
import { StepHeader } from "@/components/StepHeader";
import { TextField } from "@/components/TextField";
import { useDebounced } from "@/hooks/useDebounced";
import { useTaste } from "@/hooks/useTaste";
import { colors, space, type } from "@/theme";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";

// Suggestions come from the first few artists user picked, a few albums each.
const SUGGEST_FROM_ARTISTS = 3;
const ALBUMS_PER_ARTIST = 2;

export default function Albums() {
    const { finishOnboarding } = useAuth();
    const taste = useTaste();

    const [query, setQuery] = useState("");
    const search = useDebounced(query.trim());
    const [results, setResults] = useState<AlbumResult[]>([]);
    const [suggestions, setSuggestions] = useState<AlbumResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Add suggestions: albums by the artists picked in the first onboarding step.
    useEffect(() => {
        if (!taste.loaded) return;

        const artists = taste.items.filter((item) => item.kind === "artist").slice(0, SUGGEST_FROM_ARTISTS);
        let current = true;

        (async () => {
            for (const artist of artists) {
                try {
                    const albums = await albumsByArtist(artist.mbid);
                    if (!current) return;
                    setSuggestions((all) => [...all, ...albums.slice(0, ALBUMS_PER_ARTIST)]);
                } catch {
                    // Skip if the artist's albums cannot be loaded.
                }
            }
        })();

        return () => {
            current = false;
        };
    }, [taste.loaded]);

    // Search albums when the query changes.
        useEffect(() => {
            if (search.length < 2) {
                setResults([]);
                setError(null);
                return;
            }
    
            // Ignore the response if the search changes before it arrives.
            let current = true;
            setLoading(true);
            searchAlbums(search)
                .then((found) => current && (setResults(found), setError(null)))
                .catch((err) => current && setError(err.message))
                .finally(() => current && setLoading(false));
    
            return () => {
                current = false;
            }
        }, [search]);
    
        const searchingNow = search.length >= 2;
        const picked = taste.items.filter((item) => item.kind === "album");
        // Suggestions user has not picked. Unpicking an album puts it back here.
        const unpicked = suggestions.filter((album) => !taste.isPicked("album", album.mbid));
        const list = searchingNow ? results : unpicked;

    return (
        <Screen>
            <StepHeader step={2} steps={2} onSkip={finishOnboarding} back />

            <View style={styles.intro}>
                <Text style={[type.title, styles.title]}>
                    Albums you love
                </Text> 
                <Text style={[type.body, styles.subtitle]}>
                    The ones you keep close to your heart.
                </Text>
            </View>

            <TextField 
                label="Search albums"
                placeholder="Positions, GUTS..."
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />

            {taste.error ? (
                <Text style={[type.small, styles.errorText]}>
                    {taste.error}
                </Text>
            ) : null}

            {error ? (
                <Text style={[type.small, styles.errorText]}>
                    {error}
                </Text>
            ) : null}

            {!searchingNow && picked.length > 0 ? (
                <View>
                    <Text style={[type.label, styles.suggestionLabel]}>
                        What you picked so far
                    </Text>

                    {picked.map((album) => (
                        <PickRow
                            key={album.mbid}
                            image={<AlbumCover url={album.coverUrl} title={album.name} />}
                            title={album.name}
                            detail={[album.artist, album.year].filter(Boolean).join(", ")}
                            picked={taste.isPicked("album", album.mbid)}
                            busy={taste.isBusy("album", album.mbid)}
                            onPress={() => taste.toggle(album)}
                        />
                    ))}
                </View>
            ) : null}

            <View>
                {!searchingNow && unpicked.length > 0 ? (
                    <Text style={[type.label, styles.suggestionLabel]}>
                        From artists you picked
                    </Text>
                ) : null}

                {loading ? <ActivityIndicator color={colors.textMuted} /> : null}

                {list.map((album) => (
                    <PickRow
                        key={album.mbid}
                        image={<AlbumCover url={album.coverUrl} title={album.title} />}
                        title={album.title}
                        detail={[album.artist, album.year].filter(Boolean).join(", ")}
                        picked={taste.isPicked("album", album.mbid)}
                        busy={taste.isBusy("album", album.mbid)}
                        onPress={() =>
                            taste.toggle({
                                kind: "album",
                                mbid: album.mbid,
                                name: album.title,
                                artist: album.artist,
                                coverUrl: album.coverUrl,
                                year: album.year,
                            })
                        }
                    />
                ))}

                {searchingNow && !loading && !error && results.length === 0 ? (
                    <Text style={[type.body, styles.emptyText]}>
                        No albums found for "{search}".
                    </Text>
                ) : null}
            </View>

            <View style={styles.footer}>
                <Text style={[type.small, styles.pickedCount]}>
                    {picked.length === 0
                        ? "Pick as many as you like"
                        : `${picked.length} picked`
                    }
                </Text>
                <Button 
                    title="Done"
                    onPress={finishOnboarding}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    intro: {
        gap: space.sm,
    },

    title: {
        color: colors.text,
    },

    subtitle: {
        color: colors.textMuted,
    },

    errorText: {
        color: colors.error,
    },

    suggestionLabel: {
        color: colors.textMuted,
        marginBottom: space.xs,
    },

    emptyText: {
        color: colors.textMuted,
    },

    footer: {
        marginTop: "auto",
        gap: space.md,
        paddingTop: space.lg,
    },

    pickedCount: {
        color: colors.textMuted,
        textAlign: "center",
    },
});