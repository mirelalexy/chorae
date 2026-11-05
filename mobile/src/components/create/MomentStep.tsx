
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { StepHeader } from "@/components/StepHeader";
import { TextField } from "@/components/TextField";
import { colors, space, type } from "@/theme";
import { useAuth } from "@/auth/AuthProvider";
import { MOMENT_EXAMPLES } from "@/content/momentExamples";

const MAX_PROMPT = 2000;

type Props = {
    prompt: string;
    onPromptChange: (prompt: string) => void;
    onClose: () => void;
    onNext: () => void;
};

export function MomentStep({ prompt, onPromptChange, onClose, onNext }: Props) {
    const { user } = useAuth();
    const canContinue = prompt.trim().length > 0;

    return (
        <>
            <StepHeader step={1} steps={3} back backLabel="Close" onBack={onClose} />

            <View style={styles.intro}>
                <Text style={styles.title}>Okay, what are we making, {user?.displayName}?</Text>
                <Text style={styles.subtitle}>
                    You bring the idea, I'll bring the music. Deal?
                </Text>
            </View>

            <TextField
                label="Your moment"
                hideLabel
                multiline
                maxLength={MAX_PROMPT}
                placeholder="Hear me out. What if we..."
                value={prompt}
                onChangeText={onPromptChange}
            />

            <View style={styles.examples}>
                <Text style={styles.examplesLabel}>Or start from one of these</Text>

                <View style={styles.chips}>
                    {MOMENT_EXAMPLES.map(({ label, moment }) => (
                        <Chip
                            key={label}
                            label={label}
                            onPress={() => onPromptChange(moment)}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <Button title="Next" onPress={onNext} disabled={!canContinue} />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    intro: {
        gap: space.sm,
        marginTop: space.sm,
    },

    title: {
        ...type.title,
        color: colors.text,
    },

    subtitle: {
        ...type.body,
        color: colors.textMuted,
    },

    examples: {
        gap: space.sm + 2,
    },

    examplesLabel: {
        ...type.label,
        color: colors.textMuted,
    },

    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: space.sm,
    },

    footer: {
        marginTop: "auto",
        paddingTop: space.lg,
    },
});