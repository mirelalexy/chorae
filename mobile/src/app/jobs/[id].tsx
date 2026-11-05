
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { getJob, getMixtape, retryJob, type Job, type Mixtape } from "@/api/mixtapes";
import { Button } from "@/components/Button";
import { CheckIcon } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { colors, space, type } from "@/theme";

const POLL_MS = 2000;

function firstSentence(text: string): string {
    return text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? text;
}

export default function Mixing() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [job, setJob] = useState<Job | null>(null);
    const [tape, setTape] = useState<Mixtape | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [round, setRound] = useState(0);

    useEffect(() => {
        let stopped = false;
        let timer: ReturnType<typeof setTimeout>;

        setJob(null);
        setTape(null);
        setError(null);

        async function check() {
            try {
                const next = await getJob(id);
                if (stopped) return;

                setJob(next);
                setError(null);

                if (next.status === "done" && next.mixtapeId) {
                    const saved = await getMixtape(next.mixtapeId);
                    if (!stopped) setTape(saved);
                    return;
                }

                if (next.status === "failed") return;
            } catch (err) {
                // Keep polling if the connection drops.
                if (!stopped) {
                    setError(err instanceof Error ? err.message : "Something went wrong.");
                }
            }

            if (!stopped) {
                timer = setTimeout(check, POLL_MS);
            }
        }

        check();

        return () => {
            stopped = true;
            clearTimeout(timer);
        };
    }, [id, round]);

    async function tryAgain() {
        try {
            await retryJob(id);
            setRound((previous) => previous + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        }
    }

    const failed = job?.status === "failed";

    return (
        <Screen>
            <View style={styles.top}>
                <Pressable
                    onPress={() => router.navigate("/tapes")}
                    accessibilityRole="button"
                    hitSlop={12}
                >
                    <Text style={styles.close}>Close</Text>
                </Pressable>
            </View>

            {tape ? (
                <>
                    <View style={styles.body}>
                        <Text style={styles.title}>Your tape is ready.</Text>
                        <Text style={styles.tapeTitle}>{tape.title}</Text>
                        <Text style={styles.quote}>{`“${firstSentence(tape.intro)}”`}</Text>
                        <Text style={styles.signature}>Curious to see what Rae made for you?</Text>
                    </View>

                    <View style={styles.footer}>
                        <Button
                            title="Open tape"
                            onPress={() =>
                                router.replace({
                                    pathname: "/mixtapes/[id]",
                                    params: { id: tape.id },
                                })
                            }
                        />
                        <Button
                            title="Make another"
                            variant="secondary"
                            onPress={() => router.replace("/new-tape")}
                        />
                    </View>
                </>
            ) : failed ? (
                <>
                    <View style={styles.body}>
                        <Text style={styles.title}>That one didn't work.</Text>
                        <Text style={styles.text}>
                            {job?.error ?? "Something went wrong while mixing it."}
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <Button title="Try again" onPress={tryAgain} />
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.body}>
                        <Text style={styles.title}>Mixing your tape</Text>

                        <View
                            style={styles.stages}
                            accessibilityRole="progressbar"
                            accessibilityLabel="What Rae is doing"
                        >
                            <Stage text="Writing the tracklist" state={stateOf(job, 0)} />
                            <Stage
                                text="Finding the songs"
                                state={stateOf(job, 1)}
                                detail={
                                    job?.status === "matching" && job.tracksTotal
                                        ? `${job.tracksMatched} of ${job.tracksTotal}`
                                        : undefined
                                }
                            />
                            <Stage text="Putting it together" state={stateOf(job, 2)} />
                        </View>
                    </View>

                    <Text style={[styles.text, styles.footer]}>
                        This takes a minute or two. You can close this; the tape will be on Tapes when it's ready.
                    </Text>
                </>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
        </Screen>
    );
}

type StageState = "done" | "now" | "next";

function stateOf(job: Job | null, stage: number): StageState {
    const current = {
        queued: 0,
        drafting: 0,
        matching: 1,
        saving: 2,
        done: 3,
        failed: 3,
    }[job?.status ?? "queued"];

    return stage < current ? "done" : stage === current ? "now" : "next";
}

type StageProps = {
    text: string;
    state: StageState;
    detail?: string;
};

function Stage({ text, state, detail }: StageProps) {
    const status = state === "done" ? "done" : state === "now" ? "in progress" : "next";

    return (
        <View
            style={styles.stage}
            accessible
            accessibilityLabel={`${text}: ${status}${detail ? `, ${detail}` : ""}`}
        >
            <View
                style={[
                    styles.mark,
                    state === "done" && styles.markDone,
                    state === "now" && styles.markNow,
                ]}
            >
                {state === "done" && (
                    <CheckIcon color={colors.textOnAccent} size={13} weight="bold" />
                )}
            </View>

            <Text style={[styles.stageText, state === "next" && styles.stageNext]}>
                {text}
            </Text>

            {detail ? <Text style={styles.stageDetail}>{detail}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    top: {
        minHeight: 44,
        justifyContent: "center",
        alignItems: "flex-start",
    },

    close: {
        ...type.bodyMedium,
        color: colors.textMuted,
    },

    cassette: {
        alignItems: "center",
        marginTop: space.lg,
    },

    body: {
        gap: space.md,
        marginTop: space.lg,
    },

    title: {
        ...type.title,
        color: colors.text,
    },

    tapeTitle: {
        ...type.title,
        color: colors.accent,
    },

    quote: {
        ...type.body,
        fontSize: 17,
        lineHeight: 25,
        color: colors.text,
    },

    signature: {
        ...type.small,
        color: colors.textMuted,
        marginTop: -space.sm,
    },

    text: {
        ...type.label,
        fontFamily: type.body.fontFamily,
        color: colors.textMuted,
    },

    stages: {
        gap: space.sm,
    },

    stage: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        minHeight: 36,
    },

    mark: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.line,
        alignItems: "center",
        justifyContent: "center",
    },

    markDone: {
        borderColor: colors.accent,
        backgroundColor: colors.accent,
    },

    markNow: {
        borderColor: colors.accent,
    },

    stageText: {
        ...type.body,
        flex: 1,
        color: colors.text,
    },

    stageNext: {
        color: colors.textMuted,
    },

    stageDetail: {
        ...type.label,
        color: colors.accent,
    },

    error: {
        ...type.small,
        color: colors.error,
    },

    footer: {
        marginTop: "auto",
        gap: space.md,
        paddingTop: space.lg,
    },
});
