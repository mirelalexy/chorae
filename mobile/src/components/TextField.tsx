import { colors, radius, space, type } from "@/theme";
import { Icon } from "phosphor-react-native";
import { ReactNode, useState } from "react";
import { type TextInputProps, StyleSheet, View, Text, TextInput, Pressable } from "react-native";
import { EyeIcon, EyeSlashIcon, XIcon } from "./icons";

type Props = TextInputProps & {
    label: string;
	hideLabel?: boolean;
    error?: string;
	icon?: Icon;
	clearable?: boolean;
};

type FieldButtonProps = {
    label: string;
    onPress: () => void;
    children: ReactNode;
};

// Shared input for forms and searches, with optional icons and actions.
export function TextField({ 
	label, 
	hideLabel = false,
	error, 
	icon: Icon,
	clearable = false,
	secureTextEntry = false,
	value,
	onChangeText,
	onFocus, 
	onBlur,
	style,
	...inputProps 
}: Props) {
	const [focused, setFocused] = useState(false);
	const [revealed, setRevealed] = useState(false);

	// Red for an error, orchid when typing, neutral otherwise.
	const borderColor = error ? colors.error : focused ? colors.accent : colors.line;
	const showClear = clearable && !secureTextEntry && Boolean(value);

	return (
		<View style={styles.field}>
			{!hideLabel && (
				<Text style={styles.label}>{label}</Text>
			)}

			<View
				style={[
                    styles.container,
                    Icon ? styles.withIcon : styles.withoutIcon,
                    { borderColor },
                ]}
			>
				{Icon && (
					<Icon color={colors.textMuted} size={18} />
				)}

				<TextInput
					{...inputProps}
					value={value}
					onChangeText={onChangeText}
					secureTextEntry={secureTextEntry && !revealed}
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
					style={[styles.input, style]}
				/>

				{showClear && (
                    <FieldButton
                        label={`Clear ${label.toLowerCase()}`}
                        onPress={() => onChangeText?.("")}
                    >
                        <XIcon
                            color={colors.textMuted}
                            size={16}
                            weight="bold"
                        />
                    </FieldButton>
                )}

				{secureTextEntry && (
                    <FieldButton
                        label={revealed ? "Hide password" : "Show password"}
                        onPress={() => setRevealed((previous) => !previous)}
                    >
                        {revealed ? (
                            <EyeSlashIcon color={colors.textMuted} size={20} />
                        ) : (
                            <EyeIcon color={colors.textMuted} size={20} />
                        )}
                    </FieldButton>
                )}
			</View>

			{error ? <Text style={styles.error}>{error}</Text> : null}
		</View>
	);
}

function FieldButton({ label, onPress, children }: FieldButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={4}
            style={styles.action}
        >
            {children}
        </Pressable>
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

    container: {
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        gap: space.sm,
        borderRadius: radius.field,
        borderWidth: 1,
        backgroundColor: colors.field,
    },

    withIcon: {
        paddingLeft: space.md + 2,
    },

    withoutIcon: {
        paddingLeft: space.lg,
    },

    input: {
        ...type.body,
        flex: 1,
        minWidth: 0,
        height: "100%",
        paddingRight: space.sm,
        color: colors.text,
        outlineWidth: 0,
    },

    action: {
        width: 44,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },

    error: {
        ...type.small,
        color: colors.error,
    },
});