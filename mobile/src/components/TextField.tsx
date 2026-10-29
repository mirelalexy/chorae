import { colors, radius, space, type } from "@/theme";
import { useState } from "react";
import { type TextInputProps, StyleSheet, View, Text, TextInput } from "react-native";

type Props = TextInputProps & {
    label: string;
    error?: string;
};

export function TextField({ label, error, onFocus, onBlur, style, ...inputProps }: Props) {
	const [focused, setFocused] = useState(false);

	// Red for an error, orchid when typing, neutral otherwise.
	const borderColor = error ? colors.error : focused ? colors.accent : colors.line;

	return (
		<View style={styles.field}>
			<Text style={styles.label}>{label}</Text>

			<TextInput
				{...inputProps}
				accessibilityLabel={label}
				accessibilityHint={error || undefined}
				placeholderTextColor={colors.placeholder}
				selectionColor={colors.accent}
				onFocus={(e) => {
					setFocused(true);
					onFocus?.(e);
				}}
				onBlur={(e) => {
					setFocused(false);
					onBlur?.(e);
				}}
				style={[styles.input, style, { borderColor }]}
			/>
			
			{error ? <Text style={styles.error}>{error}</Text> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	field: {
		gap: space.sm,
	},

	label: {
		...type.label,
		color: colors.textMuted,
	},

	input: {
		...type.body,
		height: 52,
		borderWidth: 1,
		borderRadius: radius.field,
		paddingHorizontal: space.lg,
		backgroundColor: colors.field,
		color: colors.text,
	},

	error: {
		...type.small,
		color: colors.error,
	}
});
