
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CheckIcon } from "@/components/icons";
import { colors, space, type } from "@/theme";

type Props = {
    title: string;
    subtitle?: string;
    selected: boolean;
    onPress: () => void;
};

// A selectable option in a settings group.
export function ChoiceRow({ title, subtitle, selected, onPress }: Props) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="radio"
            accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
            accessibilityState={{ checked: selected }}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
            <View style={styles.text}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>

            <View
                accessible={false}
                style={[styles.mark, selected && styles.markOn]}
            >
                {selected ? (
                    <CheckIcon color={colors.textOnAccent} size={14} weight="bold" />
                ) : null}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        minHeight: 52,
        paddingVertical: space.md,
        paddingHorizontal: space.lg,
    },

    pressed: {
        opacity: 0.75,
    },

    text: {
        flex: 1,
        gap: 2,
    },
    
    title: {
        ...type.bodyMedium,
        color: colors.text,
    },

    subtitle: {
        ...type.small,
        color: colors.textMuted,
    },

    mark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.line,
        alignItems: "center",
        justifyContent: "center",
    },
    
    markOn: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
});