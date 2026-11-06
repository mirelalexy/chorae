import { Text, View, StyleSheet } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { TAB_BAR_SPACE } from "@/components/TabBar";
import { Screen } from "@/components/Screen";
import { colors, space, type } from "@/theme";
import { CoverRow } from "@/components/CoverRow";
import { Section } from "@/components/Section";
import { useTapes } from "@/hooks/useTapes";
import { TapeCover } from "@/components/tape/TapeCover";
import { router } from "expo-router";
import { TapeArt } from "@/components/tapes/TapeArt";

// A placeholder until the profile and settings.
export default function Profile() {
    const { user, logOut } = useAuth();
    const library = useTapes();

    return (
        <Screen bottomSpace={TAB_BAR_SPACE}>
            <View style={styles.profile}>
                <Avatar name={user?.displayName ?? "?"} size={72} />
                <Text style={styles.name}>{user?.displayName}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

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
            
            <View style={styles.footer}>
                <Button title="Log out" onPress={logOut} />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    profile: {
        alignItems: "center",
        gap: space.md,
        marginTop: space.xxl,
    },

    name: {
        ...type.heading,
        color: colors.text,
    },

    email: {
        ...type.body,
        color: colors.textMuted,
    },

    footer: {
        marginTop: "auto",
    },
});