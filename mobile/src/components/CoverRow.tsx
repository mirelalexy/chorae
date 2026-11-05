import { colors, space, type } from "@/theme";
import { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export type CoverRowItem = {
    key: string;
    art: ReactNode;
    title: string;
    details?: string[];
    onPress?: () => void;
    accessibilityLabel?: string;
};

type Props = {
    items: CoverRowItem[];
    size?: number;
};

export const COVER_ROW_ITEM_SIZE = 132;

// A horizontally scrolling row of artwork, titles, and details.
export function CoverRow({ items, size = COVER_ROW_ITEM_SIZE }: Props) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.row}
            contentContainerStyle={styles.content}
        >
            {items.map((item) => (
                <CoverItem key={item.key} item={item} size={size} />
            ))}
        </ScrollView>
    );
}

function CoverItem({ item, size }: { item: CoverRowItem; size: number }) {
    const label = item.accessibilityLabel ?? [item.title, ...(item.details ?? [])].join(", ");

    const content = (
        <>
            {item.art}

            <Text style={styles.title} numberOfLines={1}>
                {item.title}
            </Text>

            {item.details?.map((line, index) => (
                <Text key={index} style={styles.detail} numberOfLines={1}>
                    {line}
                </Text>
            ))}
        </>
    );

    if (item.onPress) {
        return (
            <Pressable
                onPress={item.onPress}
                accessibilityRole="button"
                accessibilityLabel={label}
                style={({ pressed }) => [
                    { width: size },
                    pressed && styles.pressed,
                ]}
            >
                {content}
            </Pressable>
        );
    }

    return (
        <View
            accessible
            accessibilityLabel={label}
            style={{ width: size }}
        >
            {content}
        </View>
    );
}

const styles = StyleSheet.create({
    // Extend the row to the screen edges while keeping its content aligned.
    row: {
        marginHorizontal: -space.xl,
    },

    content: {
        paddingHorizontal: space.xl,
        gap: space.md + 2,
    },

    pressed: {
        opacity: 0.7,
    },

    title: {
        ...type.bodyMedium,
        marginTop: space.sm,
        color: colors.text,
    },

    detail: {
        ...type.small,
        color: colors.textMuted,
    },
});