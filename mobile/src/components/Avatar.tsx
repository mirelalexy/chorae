import { Image } from "expo-image";
import { Text, View, StyleSheet } from "react-native";
import { colors, fonts } from "@/theme";
import { useState } from "react";

type Props = {
    name: string;
    size?: number;
    url?: string | null;
}
// Profile picture for the user/artist, or their initials when there isn't one.
export function Avatar({ name, size = 40, url }: Props) {
    const [failed, setFailed] = useState<string | null>(null);

    const circle = { 
        width: size, 
        height: size, 
        borderRadius: size / 2 
    };

    if (url && failed !== url) {
        return (
            <Image
                aria-hidden 
                source={{ uri: url }} 
                style={[styles.container, circle]} 
                contentFit="cover" 
                transition={150} 
                onError={() => setFailed(url)} 
            />
        );
    }

    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]!.toUpperCase())
        .join("");

    return (
        <View
            aria-hidden
            style={[styles.container, circle]}
        >
            <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.line,
        alignItems: "center",
        justifyContent: "center",
    },

    initials: {
        fontFamily: fonts.semibold,
        color: colors.text,
    },
});