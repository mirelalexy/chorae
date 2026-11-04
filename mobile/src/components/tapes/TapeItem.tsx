
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MixtapeSummary } from "@/api/mixtapes";
import { PlusIcon } from "@/components/icons";
import { TapeArt } from "@/components/tapes/TapeArt";
import { colors, radius, space, type } from "@/theme";
import { duration } from "@/utils/format";

export type Layout = "list" | "grid";

const KIND = {
    generated: "Rae generated",
    curated: "Rae curated",
} as const;

export function tapeDetail(tape: MixtapeSummary, layout: Layout): string {
    const count = tape.trackCount;
    const songs = `${count} ${count === 1 ? "song" : "songs"} · ${duration(tape.totalMs)}`;
    const separator = layout === "list" ? " · " : "\n";

    return `${KIND[tape.origin]}${separator}${songs}`;
}

type BaseItemProps = {
    layout: Layout;
    size: number;
    onPress: () => void;
};

type ItemProps = BaseItemProps & {
    art: ReactNode;
    title: string;
    detail: string;
    disabled?: boolean;
    label?: string;
};

type TapeItemProps = BaseItemProps & {
    tape: MixtapeSummary;
};

type NewTapeItemProps = BaseItemProps & {
    detail: string;
    disabled: boolean;
};

// Shared layout for existing tapes and the new tape tile.
function Item({
    layout,
    size,
    art,
    title,
    detail,
    onPress,
    disabled = false,
    label,
}: ItemProps) {
    const row = layout === "list";

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label ?? `${title}, ${detail}`}
            accessibilityState={{ disabled }}
            style={({ pressed }) => [
                styles.item,
                row ? styles.listItem : styles.gridItem,
                !row && { width: size },
                disabled ? styles.disabled : pressed && styles.pressed,
            ]}
        >
            {art}

            <View style={row ? styles.listContent : styles.gridContent}>
                <Text style={styles.title} numberOfLines={row ? 1 : 2}>
                    {title}
                </Text>

                <Text style={styles.detail} numberOfLines={row ? 1 : 2}>
                    {detail}
                </Text>
            </View>
        </Pressable>
    );
}

export function TapeItem({ tape, layout, size, onPress }: TapeItemProps) {
    return (
        <Item
            layout={layout}
            size={size}
            art={<TapeArt covers={tape.covers} size={size} />}
            title={tape.title}
            detail={tapeDetail(tape, layout)}
            onPress={onPress}
        />
    );
}

export function NewTapeItem({
    layout,
    size,
    detail,
    disabled,
    onPress,
}: NewTapeItemProps) {
    const art = (
        <View
            style={[
                styles.newTapeArt,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 10,
                },
            ]}
        >
            <View style={styles.plus}>
                <PlusIcon
                    color={colors.textOnAccent}
                    size={20}
                    weight="bold"
                />
            </View>
        </View>
    );

    return (
        <Item
            layout={layout}
            size={size}
            art={art}
            title="New tape"
            detail={detail}
            onPress={onPress}
            disabled={disabled}
        />
    );
}

const styles = StyleSheet.create({
    item: {
        borderRadius: radius.pill,
    },

    listItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.md + 2,
        paddingVertical: space.sm,
    },

    gridItem: {
        flexDirection: "column",
        alignItems: "stretch",
        gap: space.sm,
    },

    listContent: {
        flex: 1,
        gap: 2,
    },

    gridContent: {
        gap: 2,
    },

    title: {
        ...type.bodyMedium,
        color: colors.text,
    },

    detail: {
        ...type.small,
        color: colors.textMuted,
    },

    disabled: {
        opacity: 0.5,
    },

    pressed: {
        opacity: 0.7,
    },

    newTapeArt: {
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.field,
        alignItems: "center",
        justifyContent: "center",
    },

    plus: {
        width: 40,
        height: 40,
        borderRadius: radius.pill,
        backgroundColor: colors.accent,
        alignItems: "center",
        justifyContent: "center",
    },
});
