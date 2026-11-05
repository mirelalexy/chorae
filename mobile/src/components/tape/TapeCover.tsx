import { colors, space } from "@/theme";
import { router } from "expo-router";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TapeArt } from "../tapes/TapeArt";
import { CaretLeftIcon } from "../icons";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

export const FADE_HEIGHT = 250;

export function TapeCover({ covers }: { covers: string[] }) {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const goBack = () => {
        if (router.canGoBack()) router.back();
        else router.navigate("/tapes");
    }

    return (
        <View style={[styles.cover, { height: width }]}>
            <TapeArt covers={covers} size={width} />

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
                    styles.back,
                    { top: insets.top + space.sm }
                ]}
            >
                <CaretLeftIcon color={colors.text} size={22} />
            </Pressable>
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

    back: {
        position: "absolute",
        left: space.lg,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(27, 26, 30, 0.6)",
        alignItems: "center",
        justifyContent: "center",
    },
});