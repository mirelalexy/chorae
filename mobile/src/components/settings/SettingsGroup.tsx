
import { Children, Fragment, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, space, type } from "@/theme";

type Props = {
    title?: string;
    inset?: number;
    variant?: "default" | "account";
    children: ReactNode;
};

export const ICON_INSET = space.lg + 32 + space.md;

export function SettingsGroup({
    title,
    inset = space.lg,
    variant = "default",
    children,
}: Props) {
    const rows = Children.toArray(children);

    return (
        <View style={styles.group}>
            {title ? (
                <Text style={styles.title} accessibilityRole="header">
                    {title}
                </Text>
            ) : null}

            <View
                style={[
                    styles.card,
                    variant === "account" && styles.account,
                ]}
            >
                {rows.map((row, index) => (
                    <Fragment key={index}>
                        {index > 0 && (
                            <View
                                style={[
                                    styles.divider,
                                    { marginLeft: inset },
                                ]}
                            />
                        )}
                        {row}
                    </Fragment>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    group: {
        gap: space.sm,
    },

    title: {
        ...type.label,
        color: colors.textMuted,
        paddingHorizontal: space.xs,    },

    card: {
        backgroundColor: colors.field,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.line,
        overflow: "hidden",
    },

    account: {
        backgroundColor: colors.accountCard,
        borderColor: colors.accountCard,
    },

    divider: {
        height: 1,
        backgroundColor: colors.line,
    },
});