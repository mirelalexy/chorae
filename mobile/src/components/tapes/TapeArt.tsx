
import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { colors } from "@/theme";

const TILE_BG_COLORS = ["#5b4a72", "#3f3a47", "#2f2c34", "#7a6494"];

type TapeArtProps = {
    covers: string[];
    size?: number;
};

type TileProps = {
    url?: string;
    bgColor: string;
    size: number;
};

// Four album covers arranged in a 2x2 grid, with fallback colors for missing artwork.
export function TapeArt({ covers, size = 140 }: TapeArtProps) {
    const tileSize = size / 2;

    return (
        <View
            aria-hidden
            style={[
                styles.art,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 10,
                },
            ]}
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
