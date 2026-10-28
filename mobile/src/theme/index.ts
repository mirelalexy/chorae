export const colors = {
    background: "#1b1a1e",
    field: "#26242a",           // inputs, raised surfaces, chips
    line: "#3b3841",            // borders, dividers
    text: "#f4f1f6",
    textMuted: "#b6b0bb",
    placeholder: "#958f9a",
    accent: "#c49bff",          // main buttons, focus, progress
    textOnAccent: "#1b1a1e",
    error: "#ff9d9d",
} as const;

export const space = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
} as const;

export const radius = {
    field: 14,
    button: 16,
    card: 18,
    pill: 999,
} as const;

export const fonts = {
    regular: "BricolageGrotesque_400Regular",
    medium: "BricolageGrotesque_500Medium",
    semibold: "BricolageGrotesque_600SemiBold",
    extrabold: "BricolageGrotesque_800ExtraBold",
} as const;

export const type = {
    title: {
        fontFamily: fonts.semibold,
        fontSize: 28,
        lineHeight: 32,
        letterSpacing: -0.5,
    },

    heading: {
        fontFamily: fonts.semibold,
        fontSize: 24,
        lineHeight: 28,
        letterSpacing: -0.4,
    },

    body: {
        fontFamily: fonts.regular,
        fontSize: 16,
        lineHeight: 22,
    },

    bodyMedium: {
        fontFamily: fonts.medium,
        fontSize: 16,
        lineHeight: 22,
    },

    label: {
        fontFamily: fonts.medium,
        fontSize: 14,
        lineHeight: 18,
    },

    small: {
        fontFamily: fonts.regular,
        fontSize: 13,
        lineHeight: 18,
    },

    button: {
        fontFamily: fonts.semibold,
        fontSize: 17,
        lineHeight: 22,
    },
} as const;