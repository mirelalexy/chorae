import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { Wordmark } from "@/components/Wordmark";
import { colors, space, type } from "@/theme";
import { Link } from "expo-router";
import { useState } from "react";
import { View, StyleSheet, Text, Switch } from "react-native";

type Errors = Partial<Record<"displayName" | "email" | "password" | "ageConfirmed", string>>;

export default function SignUp() {
    const { signUp } = useAuth();
    
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [ageConfirmed, setAgeConfirmed] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Use the same rules the API checks, so mistakes are caught before sending.
    function validate(): Errors {
        const found: Errors = {};

        if (!displayName.trim()) found.displayName = "Tell Rae what to call you.";
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) found.email = "Enter a valid email.";
        if (password.length < 10) found.password = "Use at least 10 characters.";
        if (!ageConfirmed) found.ageConfirmed = "You need to be 18 or older to use Chorae.";

        return found;
    }

    async function submit() {
        const found = validate();
        setErrors(found);
        setFormError(null);
        if (Object.keys(found).length > 0) return;

        setLoading(true);

        try {
            await signUp({
                displayName: displayName.trim(),
                email: email.trim(),
                password,
                ageConfirmed,
            });
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                setErrors({ email: err.message });
            } else if (err instanceof ApiError && err.issues.length > 0) {
                // The API's Zod issues name the field.
                const fromApi: Errors = {};

                for (const issue of err.issues) {
                    fromApi[issue.path[0] as keyof Errors] = issue.message;
                }

                setErrors(fromApi);
            } else {
                setFormError(err instanceof Error ? err.message : "Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <Screen>
            <View style={styles.heading}>
                <Wordmark size={30} />
                <Text style={styles.title}>Tell Rae a moment.</Text>
                <Text style={styles.subtitle}>Get back a mixtape.</Text>
            </View>

            <View style={styles.form}>
                <TextField 
                    label="What should Rae call you?"
                    placeholder="Your name"
                    value={displayName}
                    onChangeText={setDisplayName}
                    error={errors.displayName}
                    autoComplete="name"
                    textContentType="name"
                />

                <TextField 
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                />

                <TextField
                    label="Password"
                    placeholder="10 or more characters"
                    value={password}
                    onChangeText={setPassword}
                    error={errors.password}
                    secureTextEntry
                    autoComplete="new-password"
                    textContentType="newPassword"
                />

                <View style={styles.ageSection}>
                    <View style={styles.ageRow}>
                        <Text style={styles.ageLabel}>I'm 18 or older.</Text>
                        <Switch 
                            value={ageConfirmed}
                            onValueChange={setAgeConfirmed}
                            accessibilityLabel="I'm 18 or older."
                            trackColor={{
                                true: colors.accent,
                                false: colors.line,
                            }}
                            ios_backgroundColor={colors.line}
                            thumbColor={colors.text}
                        />
                    </View>

                    {errors.ageConfirmed ? (
                        <Text style={styles.ageError}>{errors.ageConfirmed}</Text>
                    ) : null}
                </View>
            </View>

            <View style={styles.footer}>
                {formError ? (
                    <Text style={styles.formError}>{formError}</Text>
                ) : null}

                <Button title="Create account" onPress={submit} loading={loading} />

                <Text style={styles.logInText}>
                    Already have an account?{" "}
                    <Link href="/log-in" style={styles.logInLink}>
                        Log in
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

    ageSection: {
        gap: space.sm,
    },

    ageRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 44,
    },

    ageLabel: {
        ...type.body,
        color: colors.text,
    },

    ageError: {
        ...type.small,
        color: colors.error,
    },

    footer: {
        marginTop: "auto",
        gap: space.lg,
        paddingTop: space.xl,
    },

    formError: {
        ...type.body,
        color: colors.error,
        textAlign: "center",
    },

    logInText: {
        ...type.body,
        color: colors.textMuted,
        textAlign: "center",
    },

    logInLink: {
        ...type.bodyMedium,
        color: colors.text,
    },
});