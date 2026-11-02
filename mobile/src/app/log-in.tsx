import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { Wordmark } from "@/components/Wordmark";
import { colors, space, type } from "@/theme";
import { Link } from "expo-router";
import { useState } from "react";
import { StyleSheet, View, Text } from "react-native";

export default function LogIn() {
    const { logIn } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit() {
        if (!email.trim || !password) {
            setError("Enter your email and password.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            await logIn({ email: email.trim(), password });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Screen>
            <View style={styles.heading}>
                <Wordmark size={30} />
                <Text style={styles.title}>Welcome back.</Text>
                <Text style={styles.subtitle}>Your tapes are where you left them.</Text>
            </View>

            <View style={styles.form}>
                <TextField 
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                />

                <TextField
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    error={error ?? undefined}
                    secureTextEntry
                    autoComplete="current-password"
                    textContentType="password"
                />
            </View>

            <View style={styles.footer}>
                <Button title="Log in" onPress={submit} loading={loading} />
                <Text style={styles.signUpText}>
                    New to Chorae?{" "}
                    <Link href="/sign-up" style={styles.signUpLink}>
                        Create an account
                    </Link>
                </Text>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    heading: {
        gap: space.md,
        marginTop: space.xxl,
    },

    title: {
        ...type.heading,
        color: colors.text,
    },

    subtitle: {
        ...type.body,
        color: colors.textMuted,
        marginTop: -space.sm,
    },

    form: {
        gap: space.lg,
        marginTop: space.lg,
    },

    footer: {
        marginTop: "auto",
        gap: space.lg,
        paddingTop: space.xl,
    },

    signUpText: {
        ...type.body,
        color: colors.textMuted,
        textAlign: "center",
    },

    signUpLink: {
        ...type.bodyMedium,
        color: colors.text,
    },
});