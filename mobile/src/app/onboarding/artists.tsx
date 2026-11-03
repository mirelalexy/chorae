import { type ArtistResult, searchArtists } from "@/api/taste";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useDebounced } from "@/hooks/useDebounced";
import { useTaste } from "@/hooks/useTaste";
import { colors, radius, space, type } from "@/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable, ActivityIndicator } from "react-native";

// Onboarding, step one: artists.
export default function Artists() {
    const { finishOnboarding } = useAuth();
    const taste = useTaste();
    
    const [query, setQuery] = useState("");
    const search = useDebounced(query.trim());
    const [results, setResults] = useState<ArtistResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Search artists when the query changes.
    useEffect(() => {
        if (search.length < 2) {
            setResults([]);
            setSearchError(null);
            return;
        }

        // Ignore the response if the search changes before it arrives.
        let current = true;
        setSearching(true);
        searchArtists(search)
            .then((found) => current && (setResults(found), setSearchError(null)))
            .catch((err) => current && setSearchError(err.message))
            .finally(() => current && setSearching(false));

        return () => {
            current = false;
        }
    }, [search])

    const picked = taste.items.filter((item) => item.kind === "artist");

    return (
        <Screen>
            {/* TO-DO: The step header. */}

            <View style={styles.intro}>
                <Text style={[type.title, { color: colors.text }]}>
                    Artists you love
                </Text> 
                <Text style={[type.body, { color: colors.textMuted }]}>
                    Rae starts from these. Pick a few. Don't worry, you can change them later.
                </Text>
            </View>

            <TextField 
                label="Search artists"
                placeholder="Bad Omens, Ariana Grande..."
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />

            {/* Pill buttons to see/delete selected artists. */}
            {picked.length > 0 ? (
                <View style={styles.pickedList}>
                    {picked.map((artist) => (
                        <Pressable
                            key={artist.id}
                            onPress={() => taste.toggle(artist)}
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${artist.name}`}
                            style={styles.pickedChip}
                        >
                            {/* TO-DO: The artist avatar. */}

                            <Text style={[type.label, { color: colors.text }]}>
                                {artist.name}
                            </Text>
                            <Text style={[type.label, { color: colors.textMuted }]}>
                                x
                            </Text>
                        </Pressable>
                    ))}
                </View>
            ) : null}

            {taste.error ? (
                <Text style={[type.small, { color: colors.error }]}>
                    {taste.error}
                </Text>
            ) : null}

            {searchError ? (
                <Text style={[type.small, { color: colors.error }]}>
                    {searchError}
                </Text>
            ) : null}

            {searching ? <ActivityIndicator color={colors.textMuted} /> : null}

            <View>
                {/* TO-DO: The artist rows. */}

                {search.length >= 2 && 
                !searching && 
                !searchError &&
                results.length === 0 ? (
                    <Text style={[type.body, { color: colors.textMuted }]}>
                        No artists found for "{search}".
                    </Text>
                ) : null
                }
            </View>

            <View style={styles.footer}>
                <Text style={[type.small, styles.pickedCount]}>
                    {picked.length === 0
                        ? "Pick as many as you like"
                        : `${picked.length} picked`
                    }
                </Text>
                <Button 
                    title="Continue"
                    onPress={() => router.push("/onboarding/albums")}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    intro: {
        gap: space.sm,
    },

    pickedList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: space.sm,
    },

    pickedChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.sm,
        paddingLeft: 4,
        paddingRight: space.md,
        height: 40,
        borderRadius: radius.pill,
        backgroundColor: colors.field,
        borderWidth: 1,
        borderColor: colors.line,
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