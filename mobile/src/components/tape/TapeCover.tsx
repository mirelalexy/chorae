import { colors, space } from "@/theme";
import { router } from "expo-router";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TapeArt } from "../tapes/TapeArt";
import { CaretLeftIcon } from "../icons";

export const COVER_HEIGHT = 360;

export function TapeCover({ covers }: { covers: string[] }) {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const goBack = () => {
        if (router.canGoBack()) router.back();
        else router.navigate("/tapes");
    }

    return (
        <View style={styles.cover}>
            <TapeArt covers={covers} size={width} />

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
        height: COVER_HEIGHT,
        overflow: "hidden",
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