
import { StyleSheet, View } from "react-native";
import { Chip } from "@/components/Chip";
import { space } from "@/theme";
import { KINDS, type Kind } from "@/utils/tapes";

type Props = {
    kind: Kind;
    onKindChange: (kind: Kind) => void;
};

export function TapesFilters({ kind, onKindChange }: Props) {
    return (
        <View style={styles.filters}>
            {KINDS.map((option) => (
                <Chip
                    key={option.key}
                    label={option.label}
                    selected={kind === option.key}
                    onPress={() => onKindChange(option.key)}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    filters: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: space.sm,
    },
});