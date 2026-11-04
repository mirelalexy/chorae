import { AlbumResult, albumsByArtist, searchAlbums } from "@/api/taste";
import { useAuth } from "@/auth/AuthProvider";
import { AlbumCover } from "@/components/AlbumCover";
import { Button } from "@/components/Button";
import { MagnifyingGlassIcon } from "@/components/icons";
import { PickRow } from "@/components/PickRow";
import { Screen } from "@/components/Screen";
import { StepHeader } from "@/components/StepHeader";
import { TextField } from "@/components/TextField";
import { useSearch } from "@/hooks/useSearch";
import { useTaste } from "@/hooks/useTaste";
import { colors, space, type } from "@/theme";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";

// Suggestions come from the first few artists user picked, a few albums each.
const SUGGEST_FROM_ARTISTS = 3;
const ALBUMS_PER_ARTIST = 2;

// Onboarding, step two: albums.
export default function Albums() {
    const { finishOnboarding } = useAuth();
    const taste = useTaste();
    const albums = useSearch(searchAlbums);

    const [suggestions, setSuggestions] = useState<AlbumResult[]>([]);

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

    const picked = taste.items.filter((item) => item.kind === "album");
    // Suggestions user has not picked. Unpicking an album puts it back here.
    const unpicked = suggestions.filter((album) => !taste.isPicked("album", album.mbid));
    const list = albums.active ? albums.results : unpicked;

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
                icon={MagnifyingGlassIcon}
                clearable
                placeholder="Positions, Fancy That..."
                value={albums.query}
                onChangeText={albums.setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />

            {taste.error ? (
                <Text style={[type.small, styles.errorText]}>
                    {taste.error}
                </Text>
            ) : null}

            {albums.error ? (
                <Text style={[type.small, styles.errorText]}>
                    {albums.error}
                </Text>
            ) : null}

            {!albums.active && picked.length > 0 ? (
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
                {!albums.active && unpicked.length > 0 ? (
                    <Text style={[type.label, styles.suggestionLabel]}>
                        From artists you picked
                    </Text>
                ) : null}

                {albums.loading ? <ActivityIndicator color={colors.textMuted} /> : null}

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

                {albums.empty && (
                    <Text style={[type.body, styles.emptyText]}>
                        No albums found for "{albums.search}".
                    </Text>
                )}
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