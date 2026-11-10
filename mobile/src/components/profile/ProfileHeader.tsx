import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { GearSixIcon } from "@/components/icons";
import { colors, space, type } from "@/theme";

const BANNER = 168;
const AVATAR = 104;

// TO DO: add banner and avatar upload.
// The top of the profile: banner, link to settings, and the profile picture.
export function ProfileHeader({ name, email }: { name: string; email: string }) {
    const insets = useSafeAreaInsets();

    return (
        <View>
            <View style={[styles.banner, { height: BANNER + insets.top }]}>
                <Pressable
                    onPress={() => router.push("/settings")}
                    accessibilityRole="button"
                    accessibilityLabel="Settings"
                    hitSlop={8}
                    style={[styles.gear, { top: insets.top + space.sm }]}
                >
                    <GearSixIcon color={colors.text} size={22} />
                </Pressable>
            </View>

            <View style={styles.identity}>
                <View style={styles.ring}>
                    <Avatar name={name} size={AVATAR} />
                </View>
                <Text style={styles.name} accessibilityRole="header">
                    {name}
                </Text>
                <Text style={styles.email}>{email}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        backgroundColor: colors.field,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },

    gear: {
        position: "absolute",
        right: space.lg,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(27, 26, 30, 0.6)",
        alignItems: "center",
        justifyContent: "center",
    },

    identity: {
        alignItems: "center",
        gap: space.xs,
        marginTop: -(AVATAR / 2) - 4,
    },

    ring: {
        padding: 4,
        borderRadius: AVATAR,
        backgroundColor: colors.background,
        marginBottom: space.sm,
    },

    name: {
        ...type.title,
        color: colors.text,
        textAlign: "center",
    },

    email: {
        ...type.body,
        fontSize: 15,
        color: colors.textMuted,
    },
});