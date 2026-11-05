
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { createMixtape, type SongResult } from "@/api/mixtapes";
import { DetailsStep } from "@/components/create/DetailsStep";
import { MomentStep } from "@/components/create/MomentStep";
import { SongsStep } from "@/components/create/SongsStep";
import { Screen } from "@/components/Screen";
import { useQuestions } from "@/hooks/useQuestions";

type Step = "moment" | "songs" | "details";

export default function Create() {
    const { prompt: initialPrompt } = useLocalSearchParams<{ prompt?: string }>();
    const [step, setStep] = useState<Step>("moment");

    const [prompt, setPrompt] = useState(initialPrompt ?? "");
    const [seeds, setSeeds] = useState<SongResult[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [minutes, setMinutes] = useState(60);
    const [story, setStory] = useState(false);

    const rae = useQuestions();
    const [starting, setStarting] = useState(false);
    const [startError, setStartError] = useState<string | null>(null);

    const songsForRae = seeds.map(({ title, artist }) => ({ title, artist }));

    useEffect(() => {
        setAnswers((rae.questions ?? []).map(() => ""));
    }, [rae.questions]);

    function toDetails() {
        setStep("details");
        rae.ask(prompt, songsForRae);
    }

    function updateAnswer(index: number, answer: string) {
        setAnswers((current) =>
            current.map((value, i) => (i === index ? answer : value))
        );
    }

    async function start() {
        if (starting || rae.loading || rae.error || !rae.questions) return;

        setStarting(true);
        setStartError(null);

        try {
            const jobId = await createMixtape({
                prompt: prompt.trim(),
                answers: rae.questions
                    .map((question, index) => ({
                        question: question.text,
                        answer: (answers[index] ?? "").trim(),
                    }))
                    .filter(({ answer }) => answer.length > 0),
                minutes,
                seeds: songsForRae,
                story,
                title: title.trim() || undefined,
            });

            // Replace the form so Back doesn't return to it after starting.
            router.replace({
                pathname: "/jobs/[id]",
                params: { id: jobId },
            });
        } catch (err) {
            setStartError(
                err instanceof Error ? err.message : "Something went wrong."
            );
            setStarting(false);
        }
    }

    return (
        <Screen>
            {step === "moment" && (
                <MomentStep
                    prompt={prompt}
                    onPromptChange={setPrompt}
                    onClose={() => router.back()}
                    onNext={() => setStep("songs")}
                />
            )}

            {step === "songs" && (
                <SongsStep
                    picked={seeds}
                    onPickedChange={setSeeds}
                    onBack={() => setStep("moment")}
                    onNext={toDetails}
                />
            )}

            {step === "details" && (
                <DetailsStep
                    prompt={prompt}
                    questions={rae.questions}
                    asking={rae.loading}
                    askError={rae.error}
                    onAskAgain={() => rae.ask(prompt, songsForRae)}
                    answers={answers}
                    onAnswerChange={updateAnswer}
                    title={title}
                    onTitleChange={setTitle}
                    minutes={minutes}
                    onMinutesChange={setMinutes}
                    story={story}
                    onStoryChange={setStory}
                    onBack={() => setStep("songs")}
                    onStart={start}
                    starting={starting}
                    startError={startError}
                />
            )}
        </Screen>
    );
}