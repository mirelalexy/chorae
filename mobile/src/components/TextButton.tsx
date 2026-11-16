import { Pressable, StyleSheet, Text } from "react-native";
import { colors, type } from "@/theme";

type Props = {
    title: string;
    label?: string;
    onPress: () => void;
    disabled?: boolean;
};

// A small action in the accent colour.
export function TextButton({ title, label, onPress, disabled = false }: Props) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label ?? title}
            accessibilityState={{ disabled }}
            hitSlop={8}
            style={styles.button}
        >
            {({ pressed }) => <Text style={[styles.title, (pressed || disabled) && styles.dim]}>{title}</Text>}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        minHeight: 44,
        justifyContent: "center",
    },

    title: {
        ...type.label,
        color: colors.accent,
    },

    dim: {
        opacity: 0.6,
    },
});