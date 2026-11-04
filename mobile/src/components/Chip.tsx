
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { XIcon } from "@/components/icons";
import { colors, radius, space, type } from "@/theme";

type Props = {
    label: string;
    onPress: () => void;
    selected?: boolean;
    icon?: ReactNode;
    removable?: boolean;
    accessibilityLabel?: string;
};

export function Chip({
    label,
    onPress,
    selected = false,
    icon,
    removable = false,
    accessibilityLabel,
}: Props) {
    const textColor = selected ? colors.textOnAccent : colors.text;

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityState={{ selected }}
            hitSlop={4}
            style={({ pressed }) => [
                styles.chip,
                selected && styles.selected,
                icon ? styles.withIcon : styles.withoutIcon,
                removable && styles.removable,
                pressed && styles.pressed,
            ]}
        >
            {icon}

            <Text style={[styles.label, { color: textColor }]}>
                {label}
            </Text>

            {removable && (
                <XIcon
                    color={selected ? colors.textOnAccent : colors.textMuted}
                    size={14}
                    weight="bold"
                />
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    chip: {
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        gap: space.sm,
        paddingRight: space.md + 2,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: "transparent",
    },

    selected: {
        borderColor: colors.accent,
        backgroundColor: colors.accent,
    },

    withIcon: {
        paddingLeft: 4,
    },

    withoutIcon: {
        paddingLeft: space.md + 2,
    },

    removable: {
        paddingRight: space.md,
    },

    pressed: {
        opacity: 0.7,
    },

    label: {
        ...type.label,
    },
});