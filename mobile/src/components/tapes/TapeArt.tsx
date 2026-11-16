
import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { colors } from "@/theme";

const TILE_BG_COLORS = ["#5b4a72", "#3f3a47", "#2f2c34", "#7a6494"];

type TapeArtProps = {
    covers: string[];
    coverUrl?: string | null;
    size?: number;
};

type TileProps = {
    url?: string;
    bgColor: string;
    size: number;
};

// The tape's own cover if it has one, else four album covers arranged in a 2x2 grid, with fallback colors for missing artwork.
export function TapeArt({ covers, coverUrl, size = 140 }: TapeArtProps) {
    const tileSize = size / 2;
    const artSize = {
        width: size,
        height: size,
        borderRadius: size / 10,
    };

    const [failed, setFailed] = useState<string | null>(null);
    
    if (coverUrl && failed !== coverUrl) {
        return (
            <Image
                aria-hidden
                source={{ uri: coverUrl }}
                style={[styles.art, artSize]}
                onError={() => setFailed(coverUrl)}
            />
        );
    }

    return (
        <View
            aria-hidden
            style={[styles.art, artSize]}
        >
            {TILE_BG_COLORS.map((bgColor, index) => (
                <Tile
                    key={index}
                    url={covers[index]}
                    bgColor={bgColor}
                    size={tileSize}
                />
            ))}
        </View>
    );
}

function Tile({ url, bgColor, size }: TileProps) {
    const [failed, setFailed] = useState(false);

    const tileStyle = {
        width: size,
        height: size,
        backgroundColor: bgColor,
    };

    if (!url || failed) {
        return <View style={tileStyle} />;
    }

    return (
        <Image
            source={{ uri: url }}
            style={tileStyle}
            onError={() => setFailed(true)}
        />
    );
}

const styles = StyleSheet.create({
    art: {
        flexDirection: "row",
        flexWrap: "wrap",
        overflow: "hidden",
        backgroundColor: colors.field,
    },
});
