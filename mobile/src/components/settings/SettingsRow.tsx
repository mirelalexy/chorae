
import type { Icon } from "phosphor-react-native";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/Avatar";
import { ArrowUpRightIcon, CaretRightIcon } from "@/components/icons";
import { colors, space, type } from "@/theme";

type Props = {
    title: string;
    subtitle?: string;
    detail?: string | null;
    icon?: Icon;
    avatarUrl?: string | null;
    onPress?: () => void;
    variant?: "default" | "account"; // account row is supposed to stand out
    danger?: boolean;
    busy?: boolean;
    chevron?: boolean;
    external?: boolean;
};

export function SettingsRow({
    title,
    subtitle,
    detail,
    icon: RowIcon,
    avatarUrl,
    onPress,
    variant = "default",
    danger = false,
    busy = false,
    chevron = !!onPress,
    external = false,
}: Props) {
    const account = variant === "account";
    const TrailingIcon = external ? ArrowUpRightIcon : CaretRightIcon;

    const content = (
        <>
            {account ? (
                <Avatar name={title} url={avatarUrl} size={44} />
            ) : RowIcon ? (
                <View style={styles.icon}>
                    <RowIcon
                        color={danger ? colors.error : colors.accent}
                        size={18}
                    />
                </View>
            ) : null}

            <View style={styles.text}>
                <Text style={[styles.title, danger && styles.danger]}>
                    {title}
                </Text>

                {subtitle && (
                    <Text style={styles.subtitle} numberOfLines={2}>
                        {subtitle}
                    </Text>
                )}
            </View>

            {detail && (
                <Text style={styles.detail} numberOfLines={1}>
                    {detail}
                </Text>
            )}

            {busy ? (
                <ActivityIndicator color={colors.textMuted} />
            ) : chevron ? (
                <TrailingIcon color={colors.textMuted} size={16} />
            ) : null}
        </>
    );

    const rowStyle = [
        styles.row,
        account && styles.account,
    ];

    if (!onPress) {
        return <View style={rowStyle}>{content}</View>;
    }

    return (
        <Pressable
            onPress={onPress}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={detail ? `${title}, ${detail}` : title}
            accessibilityState={{ disabled: busy, busy }}
            style={({ pressed }) => [
                ...rowStyle,
                pressed && styles.pressed,
            ]}
        >
            {content}
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

    account: {
        minHeight: 76,
    },

    pressed: {
        opacity: 0.75,
    },

    icon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: colors.glow,
        alignItems: "center",
        justifyContent: "center",
    },

    text: {
        flex: 1,
        gap: 2,
    },

    title: {
        ...type.bodyMedium,
        color: colors.text,
    },

    danger: {
        color: colors.error,
    },

    subtitle: {
        ...type.small,
        color: colors.textMuted,
    },

    detail: {
        ...type.body,
        color: colors.textMuted,
        flexShrink: 1,
        maxWidth: "55%",
    },
});