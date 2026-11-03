import { useState } from "react";
import { Image, Text, View, StyleSheet } from "react-native";
import { colors, fonts, radius } from "@/theme";

// Not every album has one, so a missing or broken image shows the album's first letter instead.
export function AlbumCover({ url, title, size = 56 }: { url: string | null; title: string; size?: number }) {
    const [failed, setFailed] = useState(false);

    const box = { 
        width: size, 
        height: size, 
        borderRadius: radius.field / 2 
    };

    if (!url || failed) {
        return (
            <View 
                aria-hidden 
                style={[styles.placeholder, box]}>
                <Text style={[styles.initial, { fontSize: size * 0.36 }]}>
                    {title.trim()[0]?.toUpperCase()}
                </Text>
            </View>
        );
    }
    
    return <Image 
        source={{ uri: url }} 
        onError={() => setFailed(true)} 
        style={[styles.cover, box]} 
        aria-hidden 
    />;
}

const styles = StyleSheet.create({
    placeholder: {
        backgroundColor: colors.field,
        borderWidth: 1,
        borderColor: colors.line,
        alignItems: "center",
        justifyContent: "center",
    },

    initial: {
        fontFamily: fonts.semibold,
        color: colors.textMuted,
    },

    cover: {
        backgroundColor: colors.field,
    },
});