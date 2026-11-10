import { StyleSheet, Text, View } from "react-native";
import type { Favorite, FavoriteKind } from "@/api/profile";
import { AlbumCover } from "@/components/AlbumCover";
import { PlusIcon } from "@/components/icons";
import { colors, radius, space, type } from "@/theme";

type Props = {
    kind: FavoriteKind;
    favorite: Favorite | null;
    size: number;
};

// A favorite's artwork: round for an artist, square for an album or a song.
// With nothing picked yet, an empty tile that invites you to add one.
export function FavoriteArt({ kind, favorite, size }: Props) {
    const round = kind === "artist";
    const shape = { 
        width: size, 
        height: size, 
        borderRadius: round ? size / 2 : radius.field / 2 
    };

    if (!favorite) {
        return (
            <View aria-hidden style={[styles.empty, shape]}>
                <PlusIcon color={colors.textMuted} size={24} />
                <Text style={styles.emptyLabel}>Add</Text>
            </View>
        );
    }

    return (
        <View aria-hidden style={[styles.clip, shape]}>
            <AlbumCover url={favorite.coverUrl} title={favorite.name} size={size} />
        </View>
    );
}

const styles = StyleSheet.create({
    clip: {
        overflow: "hidden",
    },

    empty: {
        alignItems: "center",
        justifyContent: "center",
        gap: space.xs,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.line,
    },

    emptyLabel: {
        ...type.label,
        color: colors.textMuted,
    },
});
