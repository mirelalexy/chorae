
import { StyleSheet, View } from "react-native";
import { Chip } from "@/components/Chip";
import { space } from "@/theme";
import { KINDS, type Kind } from "@/utils/tapes";

type Props = {
    kind: Kind | null; // null: no filter, show all tapes
    onKindChange: (kind: Kind | null) => void;
};

export function TapesFilters({ kind, onKindChange }: Props) {
    return (
        <View style={styles.filters}>
            {KINDS.map((option) => {
                const selected = kind === option.key;
                return (
                    <Chip
                        key={option.key}
                        label={option.label}
                        selected={selected}
                        removable={selected}
                        onPress={() => onKindChange(selected ? null : option.key)}
                    />
                );
            })}
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