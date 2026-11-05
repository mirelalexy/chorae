import { StyleSheet, useWindowDimensions, View } from "react-native";
import type { MixtapeSummary, Today } from "@/api/mixtapes";
import { NewTapeItem, TapeItem, type Layout } from "@/components/tapes/TapeItem";
import { space } from "@/theme";
import { leftToday } from "@/utils/format";

const GRID_GAP = space.lg;

type Props = {
    tapes: MixtapeSummary[];
    today: Today | null;
    layout: Layout;
    searching: boolean;
    onNewTape: () => void;
    onOpenTape: (tape: MixtapeSummary) => void;
};

export function TapesLibrary({ tapes, today, layout, searching, onNewTape, onOpenTape }: Props) {
    const { width } = useWindowDimensions();

    const grid = layout === "grid";
    const size = grid
        ? (width - space.xl * 2 - GRID_GAP) / 2
        : 64;

    const noneLeft = today !== null && today.used >= today.limit;

    return (
        <View style={grid ? styles.grid : styles.list}>
            {!searching && (
                <NewTapeItem
                    layout={layout}
                    size={size}
                    detail={today ? leftToday(today) : "Tell Rae a moment"}
                    disabled={noneLeft}
                    onPress={onNewTape}
                />
            )}

            {tapes.map((tape) => (
                <TapeItem
                    key={tape.id}
                    tape={tape}
                    layout={layout}
                    size={size}
                    onPress={() => onOpenTape(tape)}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: {
        gap: space.xs,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: GRID_GAP,
    },
});
