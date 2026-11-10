import { Text, View, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/Button";
import { TAB_BAR_SPACE } from "@/components/TabBar";
import { colors, space, type } from "@/theme";
import { CoverRow } from "@/components/CoverRow";
import { Section } from "@/components/Section";
import { useTapes } from "@/hooks/useTapes";
import { router } from "expo-router";
import { TapeArt } from "@/components/tapes/TapeArt";
import { ProfileHeader } from "@/components/profile/ProfileHeader";

export default function Profile() {
    const { user } = useAuth();
    const library = useTapes();

    return (
        <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: space.xl + TAB_BAR_SPACE }}>
            <ProfileHeader name={user?.displayName ?? ""} email={user?.email ?? ""} />

            <Section
                title="Recently"
                subtitle="Your latest mixtapes, made with Rae's help."
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },
});