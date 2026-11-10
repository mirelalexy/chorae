import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { updateProfile, type FavoriteKind } from "@/api/profile";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { FavoritePicker } from "@/components/profile/FavoritePicker";
import { GenrePicker } from "@/components/profile/GenrePicker";
import { Screen } from "@/components/Screen";
import { Section } from "@/components/Section";
import { TextField } from "@/components/TextField";
import { useProfile } from "@/hooks/useProfile";
import { colors, space, type } from "@/theme";
import { HEART } from "./(tabs)/profile";

const MAX_ABOUT = 200;

export default function EditProfile() {
    const { refreshUser } = useAuth();
    const { page, setPage, error: loadError } = useProfile();

    const [name, setName] = useState("");
    const [about, setAbout] = useState("");
    const [genres, setGenres] = useState<string[]>([]);
    const [filled, setFilled] = useState(false);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fill the form once, when the profile first arrives.
    useEffect(() => {
        if (!page || filled) return;
        setName(page.profile.displayName);
        setAbout(page.profile.about ?? "");
        setGenres(page.profile.genres);
        setFilled(true);
    }, [page, filled]);

    async function save() {
        if (saving) return;
        if (!name.trim()) {
            setError("Your name can't be empty.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await updateProfile({ displayName: name.trim(), about: about.trim(), genres });
            await refreshUser();
            router.back();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't save your profile.");
            setSaving(false);
        }
    }

    return (
        <Screen>
            <PageHeader title="Edit profile" />

            {!page ? (
                loadError ? (
                    <Text style={styles.error}>{loadError}</Text>
                ) : (
                    <ActivityIndicator color={colors.textMuted} style={styles.loading} />
                )
            ) : (
                <>
                    <View style={styles.fields}>
                        <TextField
                            label="Name"
                            value={name}
                            onChangeText={setName}
                            maxLength={50}
                            autoComplete="name"
                            textContentType="name"
                        />

                        <View style={styles.about}>
                            <TextField
                                label="About you"
                                multiline
                                placeholder="Tell me something the playlists won't..."
                                value={about}
                                onChangeText={setAbout}
                                maxLength={MAX_ABOUT}
                            />
                            <Text style={styles.count} aria-live="polite">
                                {about.length}/{MAX_ABOUT}
                            </Text>
                        </View>
                    </View>

                    <Section title="Your kind of noise" subtitle="Three genres. A tiny glimpse into your brain.">
                        <GenrePicker genres={genres} onChange={setGenres} />
                    </Section>

                    <Section title="What's in your heart?" subtitle="One artist, one album, one song. Saved as soon as you pick.">
                        <View style={styles.hearts}>
                            {HEART.map(({ kind, label }) => (
                                <FavoritePicker
                                    key={kind}
                                    kind={kind}
                                    label={label}
                                    favorite={page.favorites[kind]}
                                    onChange={(favorite) =>
                                        setPage({ ...page, favorites: { ...page.favorites, [kind]: favorite } })
                                    }
                                />
                            ))}
                        </View>
                    </Section>

                    <View style={styles.footer}>
                        {error ? <Text style={styles.error}>{error}</Text> : null}
                        <Button title="Save" onPress={save} loading={saving} />
                    </View>
                </>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    loading: {
        marginTop: space.xxl,
    },

    fields: {
        gap: space.lg,
        marginTop: space.sm,
    },

    about: {
        gap: space.xs,
    },

    count: {
        ...type.small,
        color: colors.textMuted,
        textAlign: "right",
    },

    hearts: {
        gap: space.xl,
    },

    footer: {
        gap: space.md,
        marginTop: space.xxl,
    },

    error: {
        ...type.small,
        color: colors.error,
        textAlign: "center",
    },
});