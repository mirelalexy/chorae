
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/Avatar";
import { colors, space, type } from "@/theme";
import { Layout } from "./TapeItem";
import { ListBulletsIcon, SquaresFourIcon } from "../icons";

type Props = {
    name: string;
    layout: Layout;
    onToggleLayout: () => void;
};

export function TapesHeader({ name, layout, onToggleLayout }: Props) {
    const grid = layout === "grid";

    return (
        <View style={styles.header}>
            <Pressable
                onPress={() => router.navigate("/profile")}
                accessibilityRole="button"
                accessibilityLabel="Your profile"
                hitSlop={8}
            >
                <Avatar name={name} size={36} />
            </Pressable>

            <Text style={styles.title}>Your tapes</Text>

            <Pressable
                onPress={onToggleLayout}
                accessibilityRole="button"
                accessibilityLabel={grid ? "Show as a list" : "Show as a grid"}
                hitSlop={8}
                style={styles.toggle}
            >
                {grid
                    ? <ListBulletsIcon color={colors.text} size={24} />
                    : <SquaresFourIcon color={colors.text} size={24} />}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        marginTop: space.sm,
    },

    title: {
        ...type.title,
        flex: 1,
        color: colors.text,
    },

    toggle: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
});