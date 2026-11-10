import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Chip } from "@/components/Chip";
import { PlusIcon } from "@/components/icons";
import { TextField } from "@/components/TextField";
import { GENRES, MAX_GENRES } from "@/content/genres";
import { colors, space, type } from "@/theme";

type Props = {
    genres: string[];
    onChange: (genres: string[]) => void;
};

// Up to five favourite genres: from the list, or typed in. Picked ones come first and can be removed.
export function GenrePicker({ genres, onChange }: Props) {
    const [custom, setCustom] = useState("");
    const full = genres.length >= MAX_GENRES;
    const has = (genre: string) => genres.some((g) => g.toLowerCase() === genre.toLowerCase());

    function add(genre: string) {
        const name = genre.trim();
        if (!name || full || has(name)) return;
        onChange([...genres, name]);
    }

    function addCustom() {
        add(custom);
        setCustom("");
    }

    return (
        <View style={styles.picker}>
            <View style={styles.chips}>
                {genres.map((genre) => (
                    <Chip
                        key={genre}
                        label={genre}
                        selected
                        removable
                        accessibilityLabel={`Remove ${genre}`}
                        onPress={() => onChange(genres.filter((g) => g !== genre))}
                    />
                ))}
                {full
                    ? null
                    : GENRES.filter((genre) => !has(genre)).map((genre) => (
                          <Chip key={genre} label={genre} onPress={() => add(genre)} />
                      ))}
            </View>

            {full ? (
                <Text style={styles.note}>That's {MAX_GENRES}. Remove one to pick another.</Text>
            ) : (
                <TextField
                    label="Add your own genre"
                    hideLabel
                    icon={PlusIcon}
                    placeholder="Add your own"
                    value={custom}
                    onChangeText={setCustom}
                    onSubmitEditing={addCustom}
                    onBlur={addCustom}
                    maxLength={30}
                    returnKeyType="done"
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    picker: {
        gap: space.lg,
    },

    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: space.sm,
    },

    note: {
        ...type.small,
        color: colors.textMuted,
    },
});
