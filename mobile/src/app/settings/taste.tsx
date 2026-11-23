
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { useCallback, useState } from "react";
import { getTaste, startTasteOver, TasteItem } from "@/api/taste";
import { router, useFocusEffect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, space, type } from "@/theme";
import { Section } from "@/components/Section";
import { Avatar } from "@/components/Avatar";
import { AlbumCover } from "@/components/AlbumCover";
import { Button } from "@/components/Button";
import { confirm } from "@/utils/confirm";

const PREVIEW_LIMIT = 6;

// Not built yet: editing the music preferences chosen during onboarding.
export default function YourTaste() {
    const [items, setItems] = useState<TasteItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [restarting, setRestarting] = useState(false);

    // Refresh taste whenever the screen regains focus.
    useFocusEffect(
        useCallback(() => {
            let active = true;

            setError(null);

            getTaste()
                .then((items) => {
                    if (active) setItems(items);
                })
                .catch((err) => {
                    if (active) {
                        setError(err instanceof Error ? err.message : "Couldn't load your taste.");
                    }
                });

            return () => {
                active = false;
            };
        }, []),
    );

    function editTaste() {
        router.push("/settings/taste/artists");
    }

    async function startOver() {
        const confirmed = await confirm(
            "Start over?",
            "Your taste picks will be cleared, but your profile favorites will stay.",
            "Start over",
        );

        if (!confirmed) return;

        setRestarting(true);
        setError(null);

        try {
            await startTasteOver();
            setItems([]);
            editTaste();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't start over.");
        } finally {
            setRestarting(false);
        }
    }

    if (!items) {
        return (
            <Screen>
                <PageHeader title="Your taste" />

                {error ? (
                    <Text style={styles.error}>{error}</Text>
                ) : (
                    <ActivityIndicator
                        color={colors.textMuted}
                        style={styles.loading}
                    />
                )}
            </Screen>
        );
    }

    const artists = items.filter((item) => item.kind === "artist");
    const albums = items.filter((item) => item.kind === "album");
    const empty = items.length === 0;

    return (
        <Screen>
            <PageHeader title="Your taste" />

            <Text style={styles.intro}>
                The artists and albums you love. 
                Rae starts from these, and only you can see them.
            </Text>

            {empty ? (
                <Text style={styles.muted}>
                    A blank canvas. Give Rae something to work with.
                </Text>
            ) : (
                <>
                    <TastePreview title="Artists" items={artists} />
                    <TastePreview title="Albums" items={albums} />
                </>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.footer}>
                <Button
                    title={empty ? "Find your favorites" : "Edit your taste"}
                    onPress={editTaste}
                />

                {!empty && (
                    <Button
                        title="Start over"
                        variant="danger"
                        onPress={startOver}
                        loading={restarting}
                    />
                )}
            </View>
        </Screen>
    );
}

// Show a handful of taste picks and the remaining count.
function TastePreview({ title, items }: { title: string; items: TasteItem[] }) {
    if (items.length === 0) return null;

    const shown = items.slice(0, PREVIEW_LIMIT);
    const remaining = items.length - shown.length;

    return (
        <Section title={title} aside={String(items.length)}>
            <View style={styles.preview}>
                {shown.map((item) => (
                    <View key={item.id} style={styles.item}>
                        {item.kind === "artist" ? (
                            <Avatar name={item.name} size={28} />
                        ) : (
                            <AlbumCover
                                url={item.coverUrl}
                                title={item.name}
                                size={28}
                            />
                        )}

                        <Text style={styles.itemName} numberOfLines={1}>
                            {item.name}
                        </Text>
                    </View>
                ))}

                {remaining > 0 && (
                    <Text style={styles.muted}>
                        and {remaining} more
                    </Text>
                )}
            </View>
        </Section>
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

    preview: {
        gap: space.sm,
    },

    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
    },

    itemName: {
        ...type.body,
        color: colors.text,
        flex: 1,
    },

    muted: {
        ...type.body,
        color: colors.textMuted,
    },

    footer: {
        marginTop: "auto",
        gap: space.md,
        paddingTop: space.xl,
    },

    error: {
        ...type.small,
        color: colors.error,
        textAlign: "center",
    },
});
