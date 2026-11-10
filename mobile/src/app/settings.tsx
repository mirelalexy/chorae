import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { colors, space, type } from "@/theme";

// Who you're signed in as and logging out.
// TO DO: Add preferences later.
export default function Settings() {
    const { user, logOut } = useAuth();

    return (
        <Screen>
            <PageHeader title="Settings" />

            <View style={styles.account}>
                <Text style={styles.label}>Signed in as</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.footer}>
                <Button title="Log out" variant="secondary" onPress={logOut} />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    account: {
        gap: space.xs,
        marginTop: space.lg,
    },

    label: {
        ...type.label,
        color: colors.textMuted,
    },

    email: {
        ...type.bodyMedium,
        color: colors.text,
    },

    footer: {
        marginTop: "auto",
    },
});
