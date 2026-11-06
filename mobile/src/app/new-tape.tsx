import { getToday, Today } from "@/api/mixtapes";
import { ExpandedRow } from "@/components/ExpandedRow";
import { ArrowsClockwiseIcon, CaretRightIcon, VinylRecordIcon } from "@/components/icons";
import { colors, radius, space, type } from "@/theme";
import { tapesAvailability } from "@/utils/format";
import { router } from "expo-router";
import { Icon } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// Two ways to build a tape: new or remake.
export default function NewTape() {
    const [today, setToday] = useState<Today | null>(null);

    useEffect(() => {
        getToday().then(setToday).catch(() => setToday(null));
    }, []);

    // Both ways use Rae, so both count towards the same daily limit.
    const noneLeft = today !== null && today.used >= today.limit;

    return (
        <>
            <View style={styles.grabber} />
            
            <View style={styles.sheet}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create a new tape</Text>

                    {today && (
                        <ExpandedRow 
                            mainText={tapesAvailability(today).label}
                            additionalText={tapesAvailability(today).detail}
                        />
                    )}
                </View>

                <Option
                    Icon={VinylRecordIcon}
                    title="From a moment"
                    detail="Tell Rae where you are, and Rae makes a tape for it."
                    disabled={noneLeft}
                    onPress={() => router.replace("/create")}
                />
                <Option
                    Icon={ArrowsClockwiseIcon}
                    title="Remake a playlist"
                    detail="Bring a playlist you have. Rae adds to it or reshapes it."
                    disabled={noneLeft}
                    onPress={() => router.replace("/remake")}
                />
            </View>
        </>
    );
}

type OptionProps = {
    Icon: Icon;
    title: string;
    detail: string;
    featured?: boolean;
    disabled: boolean;
    onPress: () => void;
};

function Option({ Icon, title, detail, featured, disabled, onPress }: OptionProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`${title}. ${detail}`}
            accessibilityState={{ disabled }}
            style={({ pressed }) => [
                styles.option,
                featured && styles.featured,
                disabled && styles.disabled,
                pressed && styles.pressed,
            ]}
        >
            <View style={styles.optionIcon}>
                <Icon color={colors.accent} size={22} />
            </View>

            <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{title}</Text>
                <Text style={styles.optionDetail}>{detail}</Text>
            </View>

            <CaretRightIcon color={colors.textMuted} size={18} style={styles.chevron} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    sheet: {
        paddingHorizontal: space.lg + 4,
        paddingTop: space.lg,
        gap: space.md,
    },

    grabber: {
        width: 36,
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.line,
        alignSelf: "center",
        marginTop: 16,
    },

    header: {
        alignItems: "baseline",
        justifyContent: "space-between",
        paddingHorizontal: space.xs,
        marginBottom: space.lg,
        marginTop: space.lg,
    },

    title: {
        ...type.heading,
        fontSize: 22,
        color: colors.text,
    },

    left: {
        ...type.small,
        color: colors.accent,
    },

    option: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        padding: space.lg,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.field,
    },

    featured: {
        borderColor: "rgba(196, 155, 255, 0.38)",
        backgroundColor: "rgba(196, 155, 255, 0.07)",
    },

    disabled: {
        opacity: 0.45,
    },

    pressed: {
        opacity: 0.75,
    },

    optionIcon: {
        width: 44,
        height: 44,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: "rgba(196, 155, 255, 0.38)",
        backgroundColor: "rgba(196, 155, 255, 0.16)",
        alignItems: "center",
        justifyContent: "center",
    },

    optionText: {
        flex: 1,
        gap: 4,
    },

    optionTitle: {
        ...type.button,
        color: colors.text,
    },

    optionDetail: {
        ...type.label,
        fontFamily: type.body.fontFamily,
        color: colors.textMuted,
    },

    chevron: {
        marginLeft: space.xs,
    },
});