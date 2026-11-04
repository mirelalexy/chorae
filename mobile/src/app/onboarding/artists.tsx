import { searchArtists } from "@/api/taste";
import { useAuth } from "@/auth/AuthProvider";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { MagnifyingGlassIcon } from "@/components/icons";
import { PickRow } from "@/components/PickRow";
import { Screen } from "@/components/Screen";
import { StepHeader } from "@/components/StepHeader";
import { TextField } from "@/components/TextField";
import { useSearch } from "@/hooks/useSearch";
import { useTaste } from "@/hooks/useTaste";
import { colors, radius, space, type } from "@/theme";
import { router } from "expo-router";
import { Text, View, StyleSheet, Pressable, ActivityIndicator } from "react-native";

// Onboarding, step one: artists.
export default function Artists() {
    const { finishOnboarding } = useAuth();
    const taste = useTaste();
    const artists = useSearch(searchArtists);

    const picked = taste.items.filter((item) => item.kind === "artist");

    return (
        <Screen>
            <StepHeader step={1} steps={2} onSkip={finishOnboarding} />

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
                icon={MagnifyingGlassIcon}
                clearable
                placeholder="Bad Omens, Ariana Grande..."
                value={artists.query}
                onChangeText={artists.setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />

            {/* Pill buttons to see/delete selected artists. */}
            {picked.length > 0 ? (
                <View style={styles.pickedList}>
                    {picked.map((artist) => (
                        <Chip
                            key={artist.id}
                            label={artist.name}
                            icon={<Avatar name={artist.name} size={30} />}
                            removable
                            accessibilityLabel={`Remove ${artist.name}`}
                            onPress={() => taste.toggle(artist)}
                        />
                    ))}
                </View>
            ) : null}

            {taste.error ? (
                <Text style={[type.small, { color: colors.error }]}>
                    {taste.error}
                </Text>
            ) : null}

            {artists.error ? (
                <Text style={[type.small, { color: colors.error }]}>
                    {artists.error}
                </Text>
            ) : null}

            {artists.loading ? <ActivityIndicator color={colors.textMuted} /> : null}

            <View>
                {artists.results.map((artist) => (
                    <PickRow 
                        key={artist.mbid}
                        image={<Avatar name={artist.name} />}
                        title={artist.name}
                        detail={[artist.disambiguation, artist.country].filter(Boolean).join(", ")}
                        picked={taste.isPicked("artist", artist.mbid)}
                        busy={taste.isBusy("artist", artist.mbid)}
                        onPress={() => taste.toggle({ 
                            kind: "artist", 
                            mbid: artist.mbid,
                            name: artist.name,
                            artist: null,
                            coverUrl: null,
                            year: null,
                        })}
                    />
                ))}

                {artists.empty && (
                    <Text style={[type.body, { color: colors.textMuted }]}>
                        No artists found for "{artists.search}".
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