import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View, StyleSheet } from "react-native";
import { colors, radius, space, type } from "@/theme";

type Props = {
    image: ReactNode; // avatar or album cover
    title: string;
    detail?: string | null;
    picked: boolean;
    busy?: boolean;
    onPress: () => void;
};

// One search result or suggestion you can pick.
export function PickRow({ image, title, detail, picked, busy = false, onPress }: Props) {
    return (
        <Pressable
            onPress={onPress}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={`${title}${detail ? `, ${detail}` : ""}`}
            accessibilityState={{ selected: picked, busy }}
            style={({ pressed }) => ([
                styles.row,
                { opacity: pressed ? 0.7 : 1 }
            ])}
        >
            {image}

            <View style={styles.info}>
                <Text 
                    style={[type.bodyMedium, { color: colors.text }]} 
                    numberOfLines={1}
                >
                    {title}
                </Text>

                {detail ? (
                    <Text 
                        style={[type.small, { color: colors.textMuted }]} 
                        numberOfLines={1}
                    >
                        {detail}
                    </Text>
                ) : null}
            </View>

            <View
                style={[
                    styles.action,
                    {
                        backgroundColor: picked ? colors.accent : "transparent",
                        borderColor: picked ? colors.accent : colors.line
                    }
                ]}
            >
                {busy ? (
                    <ActivityIndicator 
                        size="small" 
                        color={picked ? colors.textOnAccent : colors.text} 
                    />
                ) : (
                    <Text style={[type.label, { color: picked ? colors.textOnAccent : colors.text }]}>
                        {picked ? "Added" : "Add"}
                    </Text>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        minHeight: 64,
        paddingVertical: space.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },

    info: {
        flex: 1,
        gap: 2,
    },

    action: {
        minWidth: 76,
        height: 34,
        paddingHorizontal: space.md,
        borderRadius: radius.pill,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
});