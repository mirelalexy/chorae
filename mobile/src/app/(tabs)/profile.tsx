import { Text, View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/Button";
import { TAB_BAR_SPACE } from "@/components/TabBar";
import { colors, space, type } from "@/theme";
import { COVER_ROW_ITEM_SIZE, CoverRow } from "@/components/CoverRow";
import { Section } from "@/components/Section";
import { useTapes } from "@/hooks/useTapes";
import { router } from "expo-router";
import { TapeArt } from "@/components/tapes/TapeArt";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { useProfile } from "@/hooks/useProfile";
import { GenreTags } from "@/components/profile/GenreTags";
import { StatTiles } from "@/components/profile/StatTiles";
import { monthYear } from "@/utils/format";
import { Favorite, FavoriteKind } from "@/api/profile";
import { FavoriteArt } from "@/components/profile/FavoriteArt";

// Kinds allowed and labels for the What's In Your Heart? section.
export const HEART: { 
    kind: FavoriteKind; 
    label: string 
}[] = [
    { kind: "artist", label: "Favorite artist" },
    { kind: "album", label: "Favorite album" },
    { kind: "song", label: "Favorite song" },
];

export default function Profile() {
    const { user } = useAuth();
    const { page, error } = useProfile();
    const library = useTapes();

    // Until the page loads, fill header with the name and email user signed in with.
    const name = page?.profile.displayName ?? user?.displayName ?? "";
    const email = page?.profile.email ?? user?.email ?? "";

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
            <ProfileHeader name={name} email={email} />

            <View style={styles.body}>
                { page ? (
                    <>
                        <View style={styles.intro}>
                            <GenreTags genres={page.profile.genres} />
                            <Button title="Edit profile" variant="secondary" onPress={() => router.push("/edit-profile")} />
                        </View>

                        <Section title="About you">
                            <View style={styles.about}>
                                {page.profile.about ? (
                                    <Text style={styles.aboutText}>{page.profile.about}</Text>
                                ) : (
                                    <Text style={styles.muted}>
                                        A little mistery never hurt anyone.
                                    </Text>
                                )}
                                <Text style={styles.since}>On Chorae since {monthYear(page.profile.createdAt)}</Text>
                            </View>
                        </Section>

                        <Section title="What's in your heart?" subtitle="Remember what you love most.">
                            <CoverRow
                                items={HEART.map(({ kind, label }) => heartItem(kind, label, page.favorites[kind], () => router.push("/edit-profile")))}
                            />
                        </Section>
                    </>
                ) : error ? (
                    <Text style={styles.error}>{error}</Text>
                ) : (
                    <ActivityIndicator color={colors.textMuted} style={styles.loading} />
                )}

                <Section
                    title="You've been busy"
                    subtitle="And Rae's got the mixtapes to prove it."
                >
                    {library.tapes ? (
                        <CoverRow items={library.tapes.map((tape) => ({
                            key: tape.id,
                            art: (
                                <TapeArt covers={tape.covers} />
                            ),
                            title: tape.title,
                            details: [`${tape.trackCount} songs`],
                            onPress() {
                                router.push({
                                    pathname: "/mixtapes/[id]",
                                    params: { id: tape.id },
                                })
                            },
                            }))} 
                        />
                    ) : (
                        <Button title="Build your first mixtape with Rae" onPress={() => router.push("/create")}/>
                    )}
                </Section>

                {page && (
                    <Section title="For the record" subtitle="A little proof of your dedication... and Rae's.">
                        <StatTiles
                            stats={[
                                { value: page.stats.tapes, label: page.stats.tapes === 1 ? "Mixtape" : "Mixtapes" },
                                { value: page.stats.songs, label: "Songs mixed" },
                                { value: page.stats.stories, label: page.stats.stories === 1 ? "Story told" : "Stories told" },
                            ]}
                        />
                    </Section>
                )}
                </View>
        </ScrollView>
    );
}

// A tile from What's In Your Heart? section.
function heartItem(kind: FavoriteKind, label: string, favorite: Favorite | null, onAdd: () => void) {
    const art = <FavoriteArt kind={kind} favorite={favorite} size={COVER_ROW_ITEM_SIZE} />;

    if (!favorite) {
        return { 
            key: kind, 
            art, 
            title: label, 
            details: ["Still deciding"], 
            onPress: onAdd, 
            accessibilityLabel: `Add your ${label.toLowerCase()}` 
        };
    }

    const details = kind === "artist" ? [label] : [favorite.artist ?? "", label].filter(Boolean);
    
    return { key: kind, art, title: favorite.name, details };
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },

    content: {
        paddingBottom: space.xl + TAB_BAR_SPACE,
    },

    body: {
        paddingHorizontal: space.xl,
    },

    intro: {
        gap: space.xl,
        marginTop: space.xl,
    },

    about: {
        gap: space.md,
    },

    aboutText: {
        ...type.body,
        color: colors.text,
    },

    muted: {
        ...type.body,
        color: colors.textMuted,
    },

    since: {
        ...type.small,
        color: colors.textMuted,
    },

    loading: {
        marginTop: space.xxl,
    },

    error: {
        ...type.body,
        color: colors.error,
        marginTop: space.xxl,
        textAlign: "center",
    },
});