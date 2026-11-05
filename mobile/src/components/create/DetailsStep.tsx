
import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, StyleSheet, Switch, Text, View } from "react-native";
import type { Question } from "@/api/mixtapes";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { StepHeader } from "@/components/StepHeader";
import { TextField } from "@/components/TextField";
import { colors, radius, space, type } from "@/theme";

const LENGTHS = [
    { label: "30 min", minutes: 30 },
    { label: "1 h", minutes: 60 },
    { label: "2 h", minutes: 120 },
    { label: "3 h", minutes: 180 },
];

function lengthHint(minutes: number): string {
    // Match the API's approximate planning: 4 minutes per song, 45 per side.
    const songs = Math.max(4, Math.round(minutes / 4));
    const sides = Math.min(6, Math.max(1, Math.round(minutes / 45)));

    return sides > 1
        ? `About ${songs} songs, over ${sides} sides.`
        : `About ${songs} songs.`;
}

type Props = {
    prompt: string;
    questions: Question[] | null;
    asking: boolean;
    askError: string | null;
    onAskAgain: () => void;
    answers: string[];
    onAnswerChange: (index: number, answer: string) => void;
    title: string;
    onTitleChange: (title: string) => void;
    minutes: number;
    onMinutesChange: (minutes: number) => void;
    story: boolean;
    onStoryChange: (story: boolean) => void;
    onBack: () => void;
    onStart: () => void;
    starting: boolean;
    startError: string | null;
};

export function DetailsStep({
    prompt,
    questions,
    asking,
    askError,
    onAskAgain,
    answers,
    onAnswerChange,
    title,
    onTitleChange,
    minutes,
    onMinutesChange,
    story,
    onStoryChange,
    onBack,
    onStart,
    starting,
    startError,
}: Props) {
    return (
        <>
            <StepHeader step={3} steps={3} back onBack={onBack} />

            {asking ? (
                <>
                    <View style={styles.intro}>
                        <Text style={styles.title}>Let me read your moment.</Text>
                        <Text style={styles.subtitle}>
                            A few seconds, then I'll have a couple of questions.
                        </Text>
                    </View>

                    <Text style={styles.quote}>{prompt}</Text>
                    <Waiting />
                </>
            ) : (
                <View style={styles.intro}>
                    <Text style={styles.title}>A few things before I start.</Text>
                    <Text style={styles.subtitle}>
                        Answer what you like. Whatever you skip, I'll decide.
                    </Text>
                </View>
            )}

            {askError ? (
                <View style={styles.block}>
                    <Text style={styles.error}>{askError}</Text>
                    <Button
                        title="Ask again"
                        variant="secondary"
                        onPress={onAskAgain}
                    />
                </View>
            ) : null}

            {(questions ?? []).map((question, index) => (
                <View key={question.text} style={styles.block}>
                    <Text style={styles.question}>{question.text}</Text>

                    {question.suggestions.length > 0 && (
                        <View style={styles.chips}>
                            {question.suggestions.map((suggestion) => (
                                <Chip
                                    key={suggestion}
                                    label={suggestion}
                                    selected={answers[index] === suggestion}
                                    onPress={() =>
                                        onAnswerChange(
                                            index,
                                            answers[index] === suggestion ? "" : suggestion
                                        )
                                    }
                                />
                            ))}
                        </View>
                    )}

                    <TextField
                        label={question.text}
                        hideLabel
                        clearable
                        placeholder={
                            question.suggestions.length > 0
                                ? "Or in your words"
                                : "In your words"
                        }
                        value={
                            question.suggestions.includes(answers[index] ?? "")
                                ? ""
                                : (answers[index] ?? "")
                        }
                        onChangeText={(text) => onAnswerChange(index, text)}
                    />
                </View>
            ))}

            {!asking && (
                <>
                    <View style={styles.divider} />

                    <View style={styles.block}>
                        <Text style={styles.question}>Got a name in mind?</Text>
                        <TextField
                            label="Got a name in mind?"
                            hideLabel
                            clearable
                            maxLength={80}
                            placeholder="Leave it empty and I'll name it"
                            value={title}
                            onChangeText={onTitleChange}
                        />
                    </View>

                    <View style={styles.block}>
                        <Text style={styles.question}>How long should it be?</Text>

                        <View style={styles.chips}>
                            {LENGTHS.map(({ label, minutes: length }) => (
                                <Chip
                                    key={length}
                                    label={label}
                                    selected={minutes === length}
                                    onPress={() => onMinutesChange(length)}
                                />
                            ))}
                        </View>

                        <Text style={styles.hint}>{lengthHint(minutes)}</Text>
                    </View>

                    <View style={styles.switchRow}>
                        <View style={styles.switchText}>
                            <Text style={styles.question}>Tell it as a story</Text>
                            <Text style={styles.hint}>
                                Each side becomes a chapter, and my notes carry it from song to song.
                            </Text>
                        </View>

                        <Switch
                            value={story}
                            onValueChange={onStoryChange}
                            accessibilityLabel="Tell it as a story"
                            trackColor={{ true: colors.accent, false: colors.line }}
                            ios_backgroundColor={colors.line}
                            thumbColor={colors.text}
                        />
                    </View>
                </>
            )}

            <View style={styles.footer}>
                {startError ? <Text style={styles.error}>{startError}</Text> : null}

                <Button
                    title="Start mixing"
                    onPress={onStart}
                    loading={starting}
                    disabled={asking || !!askError || !questions}
                />
            </View>
        </>
    );
}

function Waiting() {
    const pulse = useRef(new Animated.Value(0.45)).current;

    useEffect(() => {
        let cancelled = false;
        let animation: Animated.CompositeAnimation | null = null;

        AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
            if (cancelled || reduceMotion) return;

            animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, {
                        toValue: 0.8,
                        duration: 900,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulse, {
                        toValue: 0.45,
                        duration: 900,
                        useNativeDriver: true,
                    }),
                ])
            );

            animation.start();
        });

        return () => {
            cancelled = true;
            animation?.stop();
        };
    }, [pulse]);

    function bar(width: `${number}%`, height: number) {
        return (
            <Animated.View
                style={[styles.placeholder, { width, height, opacity: pulse }]}
            />
        );
    }

    return (
        <View
            style={styles.waiting}
            accessibilityRole="progressbar"
            accessibilityLabel="Rae is writing questions"
        >
            {bar("70%", 20)}
            {bar("100%", 44)}
            <View style={{ height: space.lg }} />
            {bar("55%", 20)}
            {bar("100%", 44)}
        </View>
    );
}

const styles = StyleSheet.create({
    intro: {
        gap: space.sm,
        marginTop: space.sm,
    },

    title: {
        ...type.title,
        color: colors.text,
    },

    subtitle: {
        ...type.body,
        color: colors.textMuted,
    },

    quote: {
        ...type.body,
        color: colors.text,
        padding: space.lg,
        borderRadius: radius.card,
        backgroundColor: colors.field,
    },

    waiting: {
        gap: space.md,
    },

    placeholder: {
        borderRadius: 10,
        backgroundColor: colors.field,
    },

    block: {
        gap: space.sm + 2,
    },

    question: {
        ...type.bodyMedium,
        fontSize: 17,
        color: colors.text,
    },

    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: space.sm,
    },

    hint: {
        ...type.label,
        fontFamily: type.body.fontFamily,
        color: colors.textMuted,
    },

    divider: {
        height: 1,
        backgroundColor: colors.line,
        marginVertical: space.sm,
    },

    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.lg,
    },

    switchText: {
        flex: 1,
        gap: 3,
    },

    error: {
        ...type.small,
        color: colors.error,
    },

    footer: {
        marginTop: "auto",
        gap: space.md,
        paddingTop: space.xl,
    },
});