
import { BlurView } from "expo-blur";
import type { Icon } from "phosphor-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, type } from "@/theme";

// Extra space so content can scroll past the floating tab bar.
export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_SPACE = TAB_BAR_HEIGHT + 48;

type TabButtonProps = PressableProps & {
    label: string;
    Icon: Icon;
    isFocused?: boolean;
};

export function GlassBar({ children }: { children?: ReactNode }) {
    const insets = useSafeAreaInsets();

    return (
        // Keep the shadow on the outside and clip the blur on the inside.
        <View style={[styles.bar, { bottom: Math.max(insets.bottom - 6, 16) }]}>
            <BlurView intensity={40} tint="dark" style={styles.glass}>
                {children}
            </BlurView>
        </View>
    );
}

// Active tab gets a tinted pill and filled icon. The others stay outlined.
export function TabButton({ label, Icon, isFocused = false, ...pressable }: TabButtonProps) {
    return (
        <Pressable
            {...pressable}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isFocused }}
            style={[styles.tab, isFocused && styles.tabFocused]}
        >
            <Icon
                color={isFocused ? colors.accent : colors.textMuted}
                size={22}
                weight={isFocused ? "fill" : "regular"}
            />
            <Text style={[styles.label, isFocused && styles.labelFocused]}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    bar: {
        position: "absolute",
        left: 24,
        right: 24,
        height: TAB_BAR_HEIGHT,
        borderRadius: 999,
        shadowColor: colors.accent,
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
    },

    glass: {
        flex: 1,
        flexDirection: "row",
        padding: 6,
        borderRadius: 999,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.glow,
        backgroundColor: "rgba(38, 36, 42, 0.55)",
    },

    tab: {
        flex: 1,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        borderWidth: 1,
        borderColor: "transparent",
        backgroundColor: "transparent",
    },

    tabFocused: {
        borderColor: "rgba(196, 155, 255, 0.38)",
        backgroundColor: "rgba(196, 155, 255, 0.16)",
    },

    label: {
        ...type.small,
        fontSize: 12,
        lineHeight: 15,
        color: colors.textMuted,
    },

    labelFocused: {
        color: colors.text,
    },
});