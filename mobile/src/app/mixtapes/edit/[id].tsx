import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { deleteMixtape, updateMixtape } from "@/api/mixtapes";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { TapeArt } from "@/components/tapes/TapeArt";
import { TextButton } from "@/components/TextButton";
import { TextField } from "@/components/TextField";
import { useMixtape } from "@/hooks/useMixtape";
import { colors, space, type } from "@/theme";
import { confirm } from "@/utils/confirm";
import { coversOf } from "@/utils/mixtape";
import { pickPicture, settlePicture, shownPicture, type PictureChange } from "@/utils/pictures";

const MAX_TITLE = 80;
const ART = 200;

// Rename a tape, give it a cover of your own (or go back to its album covers), or delete it.
export default function EditTape() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { tape, error: loadError } = useMixtape(id);

    const [title, setTitle] = useState("");
    const [filled, setFilled] = useState(false);
    // The cover is only uploaded on Save, so backing out leaves nothing behind.
    const [cover, setCover] = useState<PictureChange>(null);

    const [busy, setBusy] = useState<"saving" | "deleting" | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fill the form once, when the tape first arrives.
    useEffect(() => {
        if (!tape || filled) return;
        setTitle(tape.title);
        setFilled(true);
    }, [tape, filled]);

    if (!tape) {
        return (
            <Screen>
                <PageHeader title="Edit tape" />
                {loadError ? <Text style={styles.error}>{loadError}</Text> : <ActivityIndicator color={colors.textMuted} style={styles.loading} />}
            </Screen>
        );
    }

    const shownCover = shownPicture(tape.coverUrl, cover);

    async function chooseCover() {
        const picked = await pickPicture("square");
        if (picked) setCover(picked);
    }

    async function save() {
        if (busy || !tape) return;
        const newTitle = title.trim();
        if (!newTitle) {
            setError("Your tape needs a name.");
            return;
        }
        setBusy("saving");
        setError(null);
        try {
            const newCover = await settlePicture("cover", cover);
            if (newTitle !== tape.title || newCover !== undefined) {
                await updateMixtape(tape.id, { title: newTitle !== tape.title ? newTitle : undefined, cover: newCover });
            }
            router.back();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't save your tape.");
            setBusy(null);
        }
    }

    async function remove() {
        if (busy || !tape) return;
        const sure = await confirm(`Delete "${tape.title}"?`, "The tape and every version of it will be gone. This can't be undone.", "Delete");
        if (!sure) return;
        setBusy("deleting");
        setError(null);
        try {
            await deleteMixtape(tape.id);
            router.dismissTo("/tapes"); // the tape's own page is gone too
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't delete your tape.");
            setBusy(null);
        }
    }

    return (
        <Screen>
            <PageHeader title="Edit tape" />

            <View style={styles.cover}>
                <TapeArt covers={coversOf(tape)} coverUrl={shownCover} size={ART} />
                <View style={styles.coverActions}>
                    <TextButton title={shownCover ? "Change cover" : "Choose a cover"} onPress={chooseCover} disabled={busy !== null} />
                    {shownCover ? (
                        <TextButton title="Use album covers" label="Remove cover and use album covers" onPress={() => setCover("remove")} disabled={busy !== null} />
                    ) : null}
                </View>
            </View>

            <TextField label="Name" value={title} onChangeText={setTitle} maxLength={MAX_TITLE} returnKeyType="done" />

            <View style={styles.footer}>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Button title="Save" onPress={save} loading={busy === "saving"} disabled={busy === "deleting"} />
                <Button title="Delete tape" variant="danger" onPress={remove} loading={busy === "deleting"} disabled={busy === "saving"} />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    loading: {
        marginTop: space.xxl,
    },

    cover: {
        alignItems: "center",
        gap: space.sm,
        marginTop: space.sm,
    },

    coverActions: {
        flexDirection: "row",
        gap: space.xl,
    },

    footer: {
        gap: space.md,
        marginTop: "auto",
        paddingTop: space.xl,
    },

    error: {
        ...type.small,
        color: colors.error,
        textAlign: "center",
    },
});