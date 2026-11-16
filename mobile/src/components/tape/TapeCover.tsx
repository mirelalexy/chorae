import { colors, space } from "@/theme";
import { router } from "expo-router";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TapeArt } from "../tapes/TapeArt";
import { CaretLeftIcon, PencilSimpleIcon } from "../icons";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

export const FADE_HEIGHT = 250;

type Props = {
    covers: string[];
    coverUrl?: string | null;
    onEdit?: () => void;
};

export function TapeCover({ covers, coverUrl, onEdit }: Props) {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const goBack = () => {
        if (router.canGoBack()) router.back();
        else router.navigate("/tapes");
    }

    return (
        <View style={[styles.cover, { height: width }]}>
            <TapeArt covers={covers} coverUrl={coverUrl} size={width} />

            <Svg
                width={width}
                height={FADE_HEIGHT}
                style={styles.fade}
                pointerEvents="none"
            >
                <Defs>
                    <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={colors.background} stopOpacity={0} />
                        <Stop offset="1" stopColor={colors.background} stopOpacity={1} />
                    </LinearGradient>
                </Defs>

                <Rect width={width} height={FADE_HEIGHT} fill="url(#fade)" />
            </Svg>

            <Pressable
                onPress={goBack}
                accessibilityRole="button"
                accessibilityLabel="back"
                hitSlop={8}
                style={[
                    styles.round,
                    styles.back,
                    { top: insets.top + space.sm }
                ]}
            >
                <CaretLeftIcon color={colors.text} size={22} />
            </Pressable>

            {onEdit && (
                <Pressable
                    onPress={onEdit}
                    accessibilityRole="button"
                    accessibilityLabel="Edit tape"
                    hitSlop={8}
                    style={[styles.round, styles.edit, { top: insets.top + space.sm }]}
                >
                    <PencilSimpleIcon color={colors.text} size={22} />
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    cover: {
        overflow: "hidden",
    },

    fade: {
        position: "absolute",
        bottom: 0,
        left: 0,
    },

    // The round buttons over the artwork: back on the left, edit on the right.
    back: {
        left: space.lg,
    },

    edit: {
        right: space.lg,
    },

    round: {
        position: "absolute",
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(27, 26, 30, 0.6)",
        alignItems: "center",
        justifyContent: "center",
    },
});