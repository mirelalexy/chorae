
import { BlurView } from "expo-blur";
import { useRef, useState, type ComponentRef } from "react";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ArrowsDownUpIcon, CheckIcon } from "@/components/icons";
import { colors, radius, space, type } from "@/theme";
import { SORTS, type Sort } from "@/utils/tapes";

type Props = {
    sort: Sort;
    onSortChange: (sort: Sort) => void;
};

const MENU_WIDTH = 232;
const MENU_GAP = 6;

export function SortMenu({ sort, onSortChange }: Props) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ 
        top: 0, 
        right: 0,
    });

    const button = useRef<ComponentRef<typeof View>>(null);
    const { width } = useWindowDimensions();

    const current = SORTS.find((option) => option.key === sort);

    function showMenu() {
        // Place the menu below the button, aligned with its right edge.
        button.current?.measureInWindow((x, y, buttonWidth, buttonHeight) => {
            setPosition({
                top: y + buttonHeight + MENU_GAP,
                right: width - x - buttonWidth,
            });
            setOpen(true);
        });
    }

    function selectSort(next: Sort) {
        onSortChange(next);
        setOpen(false);
    }

    return (
        <>
            <Pressable
                ref={button}
                onPress={showMenu}
                accessibilityRole="button"
                accessibilityLabel={`Sort: ${current?.label ?? "Recently updated"}`}
                accessibilityHint="Choose how to sort your tapes"
                hitSlop={8}
                style={styles.button}
            >
                <ArrowsDownUpIcon color={colors.text} size={24} />
            </Pressable>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setOpen(false)}
            >
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => setOpen(false)}
                    accessibilityLabel="Close the sort menu"
                />

                <View
                    style={[
                        styles.shadow,
                        { top: position.top, right: position.right },
                    ]}
                >
                    <BlurView
                        intensity={40}
                        tint="dark"
                        style={styles.menu}
                        accessibilityRole="menu"
                    >
                        <Text style={styles.heading}>Sort by</Text>

                        {SORTS.map((option) => {
                            const selected = option.key === sort;

                            return (
                                <Pressable
                                    key={option.key}
                                    onPress={() => selectSort(option.key)}
                                    accessibilityRole="menuitem"
                                    accessibilityState={{ selected }}
                                    style={({ pressed }) => [
                                        styles.option,
                                        pressed && styles.pressed,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.label,
                                            selected && styles.selectedLabel,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>

                                    {selected && (
                                        <CheckIcon
                                            color={colors.accent}
                                            size={18}
                                            weight="bold"
                                        />
                                    )}
                                </Pressable>
                            );
                        })}
                    </BlurView>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },

    // The outer layer casts the shadow and the inner layer clips the blur.
    shadow: {
        position: "absolute",
        width: MENU_WIDTH,
        borderRadius: radius.card,
        shadowColor: colors.accent,
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
    },

    menu: {
        paddingVertical: space.sm,
        borderRadius: radius.card,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.glow,
        backgroundColor: "rgba(38, 36, 42, 0.85)",
    },

    heading: {
        ...type.small,
        color: colors.textMuted,
        paddingHorizontal: space.lg,
        paddingVertical: space.xs,
    },

    option: {
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: space.lg,
    },

    pressed: {
        backgroundColor: "rgba(196, 155, 255, 0.12)",
    },

    label: {
        ...type.body,
        color: colors.text,
    },

    selectedLabel: {
        fontFamily: type.bodyMedium.fontFamily,
        color: colors.accent,
    },
});
