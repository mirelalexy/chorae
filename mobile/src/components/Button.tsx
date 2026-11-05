import { colors, radius, type } from "@/theme";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

type Props = {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: "primary" | "secondary";
}

export function Button({ title, onPress, loading = false, disabled = false, variant = "primary" }: Props) {
    const secondary = variant === "secondary";
    const inactive = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            disabled={inactive}
            accessibilityRole="button"
            accessibilityState={{ disabled: inactive, busy: loading }}
            style={({ pressed }) => [
                styles.button,
                secondary && styles.secondary,
                disabled && styles.disabled,
                pressed && !inactive && styles.pressed,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={secondary ? colors.text : colors.textOnAccent} />
            ) : (
                <Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>
            )}

        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 56,
        borderRadius: radius.button,
        backgroundColor: colors.accent,
        alignItems: "center",
        justifyContent: "center",
    },

    secondary: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: colors.line,
    },

    secondaryText: {
        color: colors.text,
    },

    pressed: {
        opacity: 0.8,
    },

    disabled: {
        opacity: 0.4,
    },

    text: {
        ...type.button,
        color: colors.textOnAccent,
    },
});
