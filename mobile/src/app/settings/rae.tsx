
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import {
    avoidArtist,
    getRaePreferences,
    MAX_NOTE,
    stopAvoiding,
    updateRaePreferences,
    type Artist,
    type Discovery,
    type RaePreferences,
} from "@/api/rae";
import { searchArtists } from "@/api/taste";
import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { MagnifyingGlassIcon } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { PickRow } from "@/components/PickRow";
import { Screen } from "@/components/Screen";
import { Section } from "@/components/Section";
import { ChoiceRow } from "@/components/settings/ChoiceRow";
import { SettingsGroup } from "@/components/settings/SettingsGroup";
import { TextButton } from "@/components/TextButton";
import { TextField } from "@/components/TextField";
import { useSearch } from "@/hooks/useSearch";
import { colors, space, type } from "@/theme";

const CHOICES: {
    value: Discovery | null;
    title: string;
    subtitle: string;
}[] = [
    { value: null, title: "Ask me each time", subtitle: "Rae asks when it matters for the tape" },
    { value: "familiar", title: "Mostly familiar", subtitle: "Artists you love, and songs close to them" },
    { value: "mix", title: "A mix", subtitle: "Some you know, plenty that's new" },
    { value: "fresh", title: "Surprise me", subtitle: "Artists you probably haven't heard yet" },
];

// Rae's personal settings. Choices save immediately, except the note has its own button.
export default function Rae() {
    const [prefs, setPrefs] = useState<RaePreferences | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [savingNote, setSavingNote] = useState(false);
    const [noteSaved, setNoteSaved] = useState(false);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const artists = useSearch(searchArtists);

    useEffect(() => {
        let active = true;

        getRaePreferences()
            .then((found) => {
                if (!active) return;
                setPrefs(found);
                setNote(found.note ?? "");
            })
            .catch((err) => {
                if (!active) return;
                setLoadError(err instanceof Error ? err.message : "Couldn't load Rae's settings.");
            });

        return () => {
            active = false;
        };
    }, []);

    const noteChanged = prefs !== null && note.trim() !== (prefs.note ?? "");

    async function saveNote() {
        if (!prefs || savingNote) return;

        setSavingNote(true);
        setError(null);

        const savedNote = note.trim();

        try {
            await updateRaePreferences({ note: savedNote });
            setPrefs((current) => current ? { ...current, note: savedNote || null } : current);
            setNoteSaved(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't save your note.");
        } finally {
            setSavingNote(false);
        }
    }

    // Show the new choice immediately and restore it if saving fails.
    async function choose(discovery: Discovery | null) {
        if (!prefs || prefs.discovery === discovery) return;

        const previous = prefs.discovery;
        setPrefs((current) => current ? { ...current, discovery } : current);
        setError(null);

        try {
            await updateRaePreferences({ discovery });
        } catch (err) {
            setPrefs((current) => current ? { ...current, discovery: previous } : current);
            setError(err instanceof Error ? err.message : "Couldn't save that.");
        }
    }

    async function toggleAvoid(artist: Artist) {
        if (!prefs || busy) return;

        const avoided = prefs.avoid.some((a) => a.mbid === artist.mbid);

        setBusy(artist.mbid);
        setError(null);

        try {
            if (avoided) {
                await stopAvoiding(artist.mbid);
                setPrefs((current) => current ? {
                    ...current,
                    avoid: current.avoid.filter((a) => a.mbid !== artist.mbid),
                } : current);
            } else {
                const saved = await avoidArtist(artist);
                setPrefs((current) => current ? {
                    ...current,
                    avoid: [...current.avoid, saved],
                } : current);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't update that.");
        } finally {
            setBusy(null);
        }
    }

    if (!prefs) {
        return (
            <Screen>
                <PageHeader title="Rae" />
                {loadError
                    ? <Text style={styles.error}>{loadError}</Text>
                    : <ActivityIndicator color={colors.textMuted} style={styles.loading} />}
            </Screen>
        );
    }

    return (
        <Screen>
            <PageHeader title="Rae" />

            <Text style={styles.intro}>
                Make it sound more like you.
            </Text>

            <Section
                title="Dear Rae,"
                subtitle="Tell Rae what she should know about your taste."
            >
                <View style={styles.note}>
                    <TextField
                        label="A note to Rae"
                        hideLabel
                        multiline
                        placeholder="I don't like obvious hits, I'm more into..."
                        value={note}
                        onChangeText={(text) => {
                            setNote(text);
                            setNoteSaved(false);
                        }}
                        maxLength={MAX_NOTE}
                    />

                    <View style={styles.noteRow}>
                        <Text style={styles.hint}>
                            {noteSaved && !noteChanged ? "Saved" : `${note.length}/${MAX_NOTE}`}
                        </Text>
                        {noteChanged ? (
                            <TextButton
                                title={savingNote ? "Saving..." : "Save note"}
                                onPress={saveNote}
                                disabled={savingNote}
                            />
                        ) : null}
                    </View>
                </View>
            </Section>

            <Section
                title="Same old, same gold?"
                subtitle="A little comfort, a little discovery. You decide."
            >
                <SettingsGroup>
                    {CHOICES.map((choice) => (
                        <ChoiceRow
                            key={choice.title}
                            title={choice.title}
                            subtitle={choice.subtitle}
                            selected={prefs.discovery === choice.value}
                            onPress={() => choose(choice.value)}
                        />
                    ))}
                </SettingsGroup>
            </Section>

            <Section
                title="Do not disturb (my ears)"
                subtitle="Some artists just aren't getting the aux. Tell Rae who to skip."
            >
                {prefs.avoid.length > 0 ? (
                    <View style={styles.chips}>
                        {prefs.avoid.map((artist) => (
                            <Chip
                                key={artist.mbid}
                                label={artist.name}
                                icon={<Avatar name={artist.name} size={30} />}
                                removable
                                accessibilityLabel={`Let Rae play ${artist.name} again`}
                                onPress={() => toggleAvoid(artist)}
                            />
                        ))}
                    </View>
                ) : null}

                <TextField
                    label="Search for an artist to never play"
                    hideLabel
                    icon={MagnifyingGlassIcon}
                    clearable
                    placeholder="Search artists"
                    value={artists.query}
                    onChangeText={artists.setQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                />

                {artists.loading ? <ActivityIndicator color={colors.textMuted} /> : null}
                {artists.error ? <Text style={styles.error}>{artists.error}</Text> : null}
                {artists.empty ? (
                    <Text style={styles.hint}>
                        No artists found for "{artists.search}".
                    </Text>
                ) : null}

                <View>
                    {artists.results.slice(0, 6).map((artist) => (
                        <PickRow
                            key={artist.mbid}
                            image={<Avatar name={artist.name} />}
                            title={artist.name}
                            detail={[artist.disambiguation, artist.country].filter(Boolean).join(", ")}
                            picked={prefs.avoid.some((a) => a.mbid === artist.mbid)}
                            busy={busy === artist.mbid}
                            onPress={() => toggleAvoid({
                                mbid: artist.mbid,
                                name: artist.name,
                            })}
                        />
                    ))}
                </View>
            </Section>

            {error ? <Text style={styles.error}>{error}</Text> : null}
        </Screen>
    );
}

const styles = StyleSheet.create({
    loading: {
        marginTop: space.xxl,
    },
    
    intro: {
        ...type.body,
        color: colors.textMuted,
        marginTop: space.sm,
    },

    note: {
        gap: space.xs,
    },
    
    noteRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 32,
    },

    hint: {
        ...type.small,
        color: colors.textMuted,
    },

    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: space.sm,
    },

    error: {
        ...type.small,
        color: colors.error,
        textAlign: "center",
    },
});