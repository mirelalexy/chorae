import { Text, View, StyleSheet } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { TAB_BAR_SPACE } from "@/components/TabBar";
import { Screen } from "@/components/Screen";
import { colors, space, type } from "@/theme";

// A placeholder until the profile and settings.
export default function Profile() {
    const { user, logOut } = useAuth();

    return (
        <Screen bottomSpace={TAB_BAR_SPACE}>
            <View style={styles.profile}>
                <Avatar name={user?.displayName ?? "?"} size={72} />
                <Text style={styles.name}>{user?.displayName}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>
            
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