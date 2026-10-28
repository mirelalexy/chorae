import { colors, fonts } from "@/theme";
import { Text } from "react-native"

type Props = {
    size?: number; // font size
}

export function Wordmark({ size = 30 }: Props) {
    return (
        <Text
            accessibilityRole="header"
            style={{
                fontFamily: fonts.extrabold,
                fontSize: size,
                lineHeight: size * 1.2,
                letterSpacing: -size * 0.05,
                color: colors.text,
            }}
        >
            chorae
        </Text>
    );
}